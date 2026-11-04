// TEMPORARY stand-in for the real backend, deleted in Phase 7.
//
// It behaves like a server so the app can be built properly: every function is async,
// it can fail, and it enforces the role rules. The real API repeats these rules in Phase 5.
//
// What is fake: passwords are not checked, and all data resets when the page reloads.
import type {
  CreateTicketInput,
  DashboardStats,
  PaginatedResponse,
  RegisterInput,
  Ticket,
  TicketComment,
  TicketQuery,
  UpdateTicketInput,
  User,
  UserRole,
} from '../types'
import { filterTickets, getDashboardStats, paginate, previewComments, previewTickets, previewUsers } from '../utils/previewData'

const SESSION_KEY = 'minidesk_preview_user_id'

// These lists are replaced with new arrays on every change and never edited in place,
// because Redux freezes objects it stores.
let users = [...previewUsers]
let tickets = [...previewTickets]
let comments = [...previewComments]

// Pretend the network takes a moment, so loading states can be seen.
function waitForNetwork(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 300))
}

function getSessionUser(): User | null {
  const savedId = localStorage.getItem(SESSION_KEY)
  return users.find((user) => String(user.id) === savedId) ?? null
}

function requireUser(): User {
  const user = getSessionUser()
  if (!user) throw new Error('Please sign in to continue.')
  return user
}

function requireVisibleTicket(user: User, ticketId: number): Ticket {
  const ticket = tickets.find((item) => item.id === ticketId)

  // A customer gets the same message for someone else's ticket as for a missing one,
  // so they can't discover which ticket numbers exist.
  if (!ticket || (user.role === 'customer' && ticket.customerId !== user.id)) {
    throw new Error('We couldn\'t find that ticket.')
  }
  return ticket
}

function getTicketsVisibleTo(user: User): Ticket[] {
  return user.role === 'customer' ? tickets.filter((ticket) => ticket.customerId === user.id) : tickets
}

// ----- Authentication -----

export async function signIn(email: string): Promise<User> {
  await waitForNetwork()
  const normalizedEmail = email.trim().toLowerCase()
  const user = users.find((item) => item.email === normalizedEmail)
  if (!user) throw new Error('The email or password is incorrect.')
  localStorage.setItem(SESSION_KEY, String(user.id))
  return user
}

export async function signUp({ name, email }: RegisterInput): Promise<User> {
  await waitForNetwork()
  const normalizedEmail = email.trim().toLowerCase()
  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('An account with this email already exists.')
  }
  // Public sign-up only ever creates customers.
  const newUser: User = {
    id: Math.max(...users.map((user) => user.id)) + 1,
    name: name.trim(),
    email: normalizedEmail,
    role: 'customer',
    createdAt: new Date().toISOString(),
  }
  users = [...users, newUser]
  localStorage.setItem(SESSION_KEY, String(newUser.id))
  return newUser
}

export async function restoreSession(): Promise<User | null> {
  await waitForNetwork()
  return getSessionUser()
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY)
}

// ----- Tickets -----

export async function listTickets(query: TicketQuery): Promise<PaginatedResponse<Ticket>> {
  await waitForNetwork()
  const user = requireUser()
  const { scope = 'all', search = '', status = '', priority = '', page = 1, limit = 10, sort = 'newest' } = query

  let visible = getTicketsVisibleTo(user)
  if (scope === 'mine' && user.role !== 'customer') {
    visible = visible.filter((ticket) => ticket.assignedAgentId === user.id)
  }

  const sortField = sort === 'updated' ? 'updatedAt' : 'createdAt'
  const sorted = [...filterTickets(visible, { search, status, priority })].sort(
    (a, b) => new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime(),
  )
  return paginate(sorted, page, limit)
}

export async function getTicket(ticketId: number): Promise<Ticket> {
  await waitForNetwork()
  return requireVisibleTicket(requireUser(), ticketId)
}

export async function addTicket(input: CreateTicketInput): Promise<Ticket> {
  await waitForNetwork()
  const user = requireUser()
  if (user.role !== 'customer') throw new Error('Only customers can create tickets.')

  const now = new Date().toISOString()
  const newTicket: Ticket = {
    ...input,
    id: Math.max(...tickets.map((ticket) => ticket.id)) + 1,
    status: 'open',
    customerId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    assignedAgentId: null,
    assignedAgentName: null,
    createdAt: now,
    updatedAt: now,
  }
  tickets = [newTicket, ...tickets]
  return newTicket
}

function checkUpdateAllowed(user: User, ticket: Ticket, changes: UpdateTicketInput) {
  const changesText = changes.title !== undefined || changes.description !== undefined
  const changesStatus = changes.status !== undefined
  const changesAgent = changes.assignedAgentId !== undefined

  if (user.role === 'admin') return

  if (user.role === 'agent') {
    if (changesText) throw new Error('Agents can\'t edit the title or description.')
    if (changesAgent && changes.assignedAgentId !== user.id) throw new Error('Agents can only assign tickets to themselves.')
    return
  }

  // Customers: requireVisibleTicket has already confirmed the ticket is their own.
  if (changesStatus || changesAgent) throw new Error('Customers can\'t change the status or assigned agent.')
  if (ticket.status !== 'open') throw new Error('You can only edit a ticket while it\'s open.')
}

export async function changeTicket(ticketId: number, changes: UpdateTicketInput): Promise<Ticket> {
  await waitForNetwork()
  const user = requireUser()
  const ticket = requireVisibleTicket(user, ticketId)
  checkUpdateAllowed(user, ticket, changes)

  let assignedAgentName = ticket.assignedAgentName
  if (changes.assignedAgentId !== undefined) {
    const agent = users.find((item) => item.id === changes.assignedAgentId && item.role === 'agent')
    if (changes.assignedAgentId !== null && !agent) throw new Error('That user isn\'t an agent.')
    assignedAgentName = agent?.name ?? null
  }

  const updatedTicket: Ticket = { ...ticket, ...changes, assignedAgentName, updatedAt: new Date().toISOString() }
  tickets = tickets.map((item) => (item.id === ticketId ? updatedTicket : item))
  return updatedTicket
}

export async function removeTicket(ticketId: number): Promise<void> {
  await waitForNetwork()
  const user = requireUser()
  if (user.role !== 'admin') throw new Error('Only admins can delete tickets.')
  requireVisibleTicket(user, ticketId)

  tickets = tickets.filter((ticket) => ticket.id !== ticketId)
  comments = comments.filter((comment) => comment.ticketId !== ticketId)
}

// ----- Comments -----

export async function listComments(ticketId: number): Promise<TicketComment[]> {
  await waitForNetwork()
  requireVisibleTicket(requireUser(), ticketId)
  return comments.filter((comment) => comment.ticketId === ticketId)
}

export async function addComment(ticketId: number, message: string): Promise<TicketComment> {
  await waitForNetwork()
  const user = requireUser()
  requireVisibleTicket(user, ticketId)

  const newComment: TicketComment = {
    id: Math.max(0, ...comments.map((comment) => comment.id)) + 1,
    ticketId,
    userId: user.id,
    authorName: user.name,
    message,
    createdAt: new Date().toISOString(),
  }
  comments = [...comments, newComment]
  return newComment
}

// ----- Dashboard -----

export async function loadDashboardStats(): Promise<DashboardStats> {
  await waitForNetwork()
  return getDashboardStats(getTicketsVisibleTo(requireUser()))
}

// ----- Users -----

export async function listUsers(role?: UserRole): Promise<User[]> {
  await waitForNetwork()
  if (requireUser().role !== 'admin') throw new Error('Only admins can view users.')
  return role ? users.filter((user) => user.role === role) : users
}
