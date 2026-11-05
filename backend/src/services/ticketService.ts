// The business rules for tickets. Controllers handle HTTP, and this file decides
// what's allowed. Phase 6 replaces the in-memory store here with SQL queries.
import type { CreateTicketInput, PaginatedResponse, PublicUser, Ticket, TicketQuery, UpdateTicketInput } from '../types'
import { AppError } from '../utils/AppError'
import { store } from './devStore'
import type { TicketRecord } from './devStore'

// Combines a ticket with its customer and agent names. In Phase 6, a SQL JOIN does this.
function toTicket(record: TicketRecord): Ticket {
  const customer = store.users.find((user) => user.id === record.customerId)
  const agent = store.users.find((user) => user.id === record.assignedAgentId)

  return {
    ...record,
    customerName: customer?.name ?? 'Unknown',
    customerEmail: customer?.email ?? '',
    assignedAgentName: agent?.name ?? null,
  }
}

function getVisibleRecords(user: PublicUser): TicketRecord[] {
  return user.role === 'customer' ? store.tickets.filter((ticket) => ticket.customerId === user.id) : store.tickets
}

// A customer gets the same 404 for someone else's ticket as for a missing one,
// so they can't discover which ticket numbers exist.
export function requireVisibleTicket(user: PublicUser, ticketId: number): TicketRecord {
  const ticket = store.tickets.find((item) => item.id === ticketId)

  if (!ticket || (user.role === 'customer' && ticket.customerId !== user.id)) {
    throw new AppError(404, 'We couldn\'t find that ticket.')
  }
  return ticket
}

export async function listTickets(user: PublicUser, query: TicketQuery): Promise<PaginatedResponse<Ticket>> {
  const { scope, search, status, priority, page, limit, sort } = query
  const searchText = search.toLowerCase()

  const matching = getVisibleRecords(user).filter((ticket) => {
    // For agents and admins, "mine" means assigned to them. Customers only have their own.
    const matchesScope = scope === 'all' || user.role === 'customer' || ticket.assignedAgentId === user.id
    const matchesSearch = ticket.title.toLowerCase().includes(searchText)
    const matchesStatus = !status || ticket.status === status
    const matchesPriority = !priority || ticket.priority === priority
    return matchesScope && matchesSearch && matchesStatus && matchesPriority
  })

  const sortField = sort === 'updated' ? 'updatedAt' : 'createdAt'
  const sorted = [...matching].sort((a, b) => new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime())

  const startIndex = (page - 1) * limit
  return {
    items: sorted.slice(startIndex, startIndex + limit).map(toTicket),
    page,
    totalPages: Math.max(1, Math.ceil(sorted.length / limit)),
    totalItems: sorted.length,
  }
}

export async function getTicket(user: PublicUser, ticketId: number): Promise<Ticket> {
  return toTicket(requireVisibleTicket(user, ticketId))
}

export async function createTicket(user: PublicUser, input: CreateTicketInput): Promise<Ticket> {
  const now = new Date().toISOString()
  const newTicket: TicketRecord = {
    ...input,
    id: Math.max(1000, ...store.tickets.map((ticket) => ticket.id)) + 1,
    status: 'open',
    customerId: user.id,
    assignedAgentId: null,
    createdAt: now,
    updatedAt: now,
  }
  store.tickets.push(newTicket)
  return toTicket(newTicket)
}

function checkUpdateAllowed(user: PublicUser, ticket: TicketRecord, changes: UpdateTicketInput): void {
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
  const ticket = requireVisibleTicket(user, ticketId)
  checkUpdateAllowed(user, ticket, changes)

  if (typeof changes.assignedAgentId === 'number') {
    const agent = store.users.find((item) => item.id === changes.assignedAgentId && item.role === 'agent')
    if (!agent) throw new AppError(400, 'Please check the highlighted fields.', { assignedAgentId: 'That user isn\'t an agent.' })
  }

  Object.assign(ticket, changes, { updatedAt: new Date().toISOString() })
  return toTicket(ticket)
}

export async function deleteTicket(user: PublicUser, ticketId: number): Promise<void> {
  requireVisibleTicket(user, ticketId)
  store.tickets = store.tickets.filter((ticket) => ticket.id !== ticketId)
  // Comments are removed with their ticket. In Phase 6, a foreign key does this.
  store.comments = store.comments.filter((comment) => comment.ticketId !== ticketId)
}
