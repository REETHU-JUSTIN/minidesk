// The business rules for tickets. Controllers handle HTTP, and this file decides
// what's allowed and runs the SQL.
import { pool } from '../config/db'
import type { CreateTicketInput, PaginatedResponse, PublicUser, Ticket, TicketQuery, UpdateTicketInput } from '../types'
import { AppError } from '../utils/AppError'

// Tickets point to users twice, so this joins the users table twice, with different names.
// JOIN: every ticket has a customer.
// LEFT JOIN: keeps tickets with no agent, whose agent columns are simply NULL.
const SELECT_TICKET = `
  SELECT
    t.id, t.title, t.description, t.category, t.priority, t.status,
    t.customer_id AS "customerId",
    customer.name AS "customerName",
    customer.email AS "customerEmail",
    t.assigned_agent_id AS "assignedAgentId",
    agent.name AS "assignedAgentName",
    t.created_at AS "createdAt",
    t.updated_at AS "updatedAt"
  FROM tickets t
  JOIN users customer ON customer.id = t.customer_id
  LEFT JOIN users agent ON agent.id = t.assigned_agent_id`

// A customer gets the same 404 for someone else's ticket as for a missing one,
// so they can't discover which ticket numbers exist.
export async function requireVisibleTicket(user: PublicUser, ticketId: number): Promise<Ticket> {
  const result = await pool.query<Ticket>(`${SELECT_TICKET} WHERE t.id = $1`, [ticketId])
  const ticket = result.rows[0]

  if (!ticket || (user.role === 'customer' && ticket.customerId !== user.id)) {
    throw new AppError(404, 'We couldn\'t find that ticket.')
  }
  return ticket
}

export async function listTickets(user: PublicUser, query: TicketQuery): Promise<PaginatedResponse<Ticket>> {
  const { scope, search, status, priority, page, limit, sort } = query

  // The WHERE clause is built piece by piece, because filters are optional.
  // Only values go in params, and each is referenced by its number, such as $1.
  const conditions: string[] = []
  const params: unknown[] = []

  function addCondition(buildSql: (placeholder: string) => string, value: unknown) {
    params.push(value)
    conditions.push(buildSql(`$${params.length}`))
  }

  // Customers only ever see their own tickets, whatever they ask for.
  if (user.role === 'customer') {
    addCondition((p) => `t.customer_id = ${p}`, user.id)
  } else if (scope === 'mine') {
    addCondition((p) => `t.assigned_agent_id = ${p}`, user.id)
  }

  if (search) {
    // In LIKE patterns, % and _ are wildcards. Escaping makes a search for "100%" literal.
    const escapedSearch = search.replace(/[\\%_]/g, '\\$&')
    addCondition((p) => `t.title ILIKE ${p}`, `%${escapedSearch}%`)
  }
  if (status) addCondition((p) => `t.status = ${p}`, status)
  if (priority) addCondition((p) => `t.priority = ${p}`, priority)

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // This is safe to place in the SQL because it can only ever be one of these two values.
  const sortColumn = sort === 'updated' ? 't.updated_at' : 't.created_at'

  const countResult = await pool.query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM tickets t ${whereClause}`, params)
  const totalItems = countResult.rows[0].total

  // LIMIT is the page size, and OFFSET skips the earlier pages.
  // The id tiebreak keeps the order stable when two tickets share a timestamp.
  const itemsResult = await pool.query<Ticket>(
    `${SELECT_TICKET} ${whereClause}
     ORDER BY ${sortColumn} DESC, t.id DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, (page - 1) * limit],
  )

  return {
    items: itemsResult.rows,
    page,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    totalItems,
  }
}

export async function getTicket(user: PublicUser, ticketId: number): Promise<Ticket> {
  return requireVisibleTicket(user, ticketId)
}

export async function createTicket(user: PublicUser, input: CreateTicketInput): Promise<Ticket> {
  const { title, description, category, priority } = input
  const result = await pool.query<{ id: number }>(
    `INSERT INTO tickets (title, description, category, priority, customer_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [title, description, category, priority, user.id],
  )
  return requireVisibleTicket(user, result.rows[0].id)
}

function checkUpdateAllowed(user: PublicUser, ticket: Ticket, changes: UpdateTicketInput): void {
  const changesText = changes.title !== undefined || changes.description !== undefined
  const changesManagement = changes.status !== undefined || changes.assignedAgentId !== undefined

  if (user.role === 'admin') return

  if (user.role === 'agent') {
    if (changesText) throw new AppError(403, 'Agents can\'t edit the title or description.')
    if (changes.assignedAgentId !== undefined && changes.assignedAgentId !== user.id) {
      throw new AppError(403, 'Agents can only assign tickets to themselves.')
    }
    return
  }

  // Customers: requireVisibleTicket has already confirmed that the ticket is their own.
  if (changesManagement) throw new AppError(403, 'Customers can\'t change the status or assigned agent.')
  if (ticket.status !== 'open') throw new AppError(403, 'You can only edit a ticket while it\'s open.')
}

export async function updateTicket(user: PublicUser, ticketId: number, changes: UpdateTicketInput): Promise<Ticket> {
  const ticket = await requireVisibleTicket(user, ticketId)
  checkUpdateAllowed(user, ticket, changes)

  if (typeof changes.assignedAgentId === 'number') {
    const agent = await pool.query(`SELECT 1 FROM users WHERE id = $1 AND role = 'agent'`, [changes.assignedAgentId])
    if (agent.rowCount === 0) {
      throw new AppError(400, 'Please check the highlighted fields.', { assignedAgentId: 'That user isn\'t an agent.' })
    }
  }

  // Only these fixed column names can reach the SQL. Values always travel as parameters.
  const columns: [string, unknown][] = [
    ['title', changes.title],
    ['description', changes.description],
    ['status', changes.status],
    ['assigned_agent_id', changes.assignedAgentId],
  ]
  const changedColumns = columns.filter(([, value]) => value !== undefined)
  const setClauses = changedColumns.map(([column], index) => `${column} = $${index + 1}`)
  const values = changedColumns.map(([, value]) => value)

  await pool.query(
    `UPDATE tickets SET ${setClauses.join(', ')}, updated_at = now() WHERE id = $${values.length + 1}`,
    [...values, ticketId],
  )
  return requireVisibleTicket(user, ticketId)
}

export async function deleteTicket(user: PublicUser, ticketId: number): Promise<void> {
  await requireVisibleTicket(user, ticketId)
  // ON DELETE CASCADE in the schema also removes this ticket's comments.
  await pool.query('DELETE FROM tickets WHERE id = $1', [ticketId])
}
