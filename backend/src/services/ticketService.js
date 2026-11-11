// The business rules for tickets. Controllers handle HTTP, and this file decides
// what's allowed and talks to MongoDB.
import { Ticket as TicketModel } from '../models/Ticket.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'

// populate looks up the referenced users, much like a JOIN in SQL.
// select limits which of their fields come back.
const PEOPLE = [
  { path: 'customer', select: 'name email' },
  { path: 'assignedAgent', select: 'name email' },
]

// Turns a database document into the shape the API promises.
function toTicket(record) {
  return {
    id: record._id.toString(),
    title: record.title,
    description: record.description,
    category: record.category,
    priority: record.priority,
    status: record.status,
    customerId: record.customer._id.toString(),
    customerName: record.customer.name,
    customerEmail: record.customer.email,
    assignedAgentId: record.assignedAgent?._id.toString() ?? null,
    assignedAgentName: record.assignedAgent?.name ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

// A customer gets the same 404 for someone else's ticket as for a missing one,
// so they can't discover which tickets exist.
export async function requireVisibleTicket(user, ticketId) {
  // lean returns plain objects, which are faster when the document won't be changed.
  const record = await TicketModel.findById(ticketId).select('-comments').populate(PEOPLE).lean()

  if (!record || (user.role === 'customer' && record.customer._id.toString() !== user.id)) {
    throw new AppError(404, 'We couldn\'t find that ticket.')
  }
  return toTicket(record)
}

export async function listTickets(user, query) {
  const { scope, search, status, priority, page, limit, sort } = query

  // The filter is built piece by piece, because each part is optional.
  const filter = {}

  // Customers only ever see their own tickets, whatever they ask for.
  if (user.role === 'customer') {
    filter.customer = user.id
  } else if (scope === 'mine') {
    filter.assignedAgent = user.id
  }

  if (search) {
    // Characters like . and * have special meanings in a regular expression.
    // Escaping them makes a search for "100%." match that exact text.
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.title = { $regex: escapedSearch, $options: 'i' }
  }
  if (status) filter.status = status
  if (priority) filter.priority = priority

  const sortField = sort === 'updated' ? 'updatedAt' : 'createdAt'

  const totalItems = await TicketModel.countDocuments(filter)

  // skip jumps over the earlier pages, and limit is the page size.
  // The _id tiebreak keeps the order stable when two tickets share a timestamp.
  const records = await TicketModel.find(filter)
    .select('-comments')
    .sort({ [sortField]: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(PEOPLE)
    .lean()

  return {
    items: records.map(toTicket),
    page,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    totalItems,
  }
}

export async function getTicket(user, ticketId) {
  return requireVisibleTicket(user, ticketId)
}

export async function createTicket(user, input) {
  const created = await TicketModel.create({ ...input, customer: user.id })
  return requireVisibleTicket(user, created.id)
}

function checkUpdateAllowed(user, ticket, changes) {
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

export async function updateTicket(user, ticketId, changes) {
  const ticket = await requireVisibleTicket(user, ticketId)
  checkUpdateAllowed(user, ticket, changes)

  const { assignedAgentId, ...otherChanges } = changes

  // MongoDB doesn't check references by itself, so this confirms the agent exists.
  if (assignedAgentId) {
    const agentExists = await User.exists({ _id: assignedAgentId, role: 'agent' })
    if (!agentExists) {
      throw new AppError(400, 'Please check the highlighted fields.', { assignedAgentId: 'That user isn\'t an agent.' })
    }
  }

  // $set changes only the fields given. Mongoose updates updatedAt automatically.
  const updates = assignedAgentId === undefined ? otherChanges : { ...otherChanges, assignedAgent: assignedAgentId }
  await TicketModel.updateOne({ _id: ticketId }, { $set: updates })
  return requireVisibleTicket(user, ticketId)
}

export async function deleteTicket(user, ticketId) {
  await requireVisibleTicket(user, ticketId)
  // Comments are embedded in the ticket, so they're removed along with it.
  await TicketModel.deleteOne({ _id: ticketId })
}
