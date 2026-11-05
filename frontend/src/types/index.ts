// Shared data shapes for the whole frontend.
// Types exist only while you develop. They are removed from the JavaScript the browser runs.

// Union types: a value must be exactly one of these strings.
export type UserRole = 'admin' | 'agent' | 'customer'
export type TicketStatus = 'open' | 'in_progress' | 'resolved'
export type TicketPriority = 'low' | 'medium' | 'high'
export type TicketCategory = 'general' | 'billing' | 'technical' | 'account'

// There is deliberately no password field. The frontend should never receive one.
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt: string // ISO date text, such as "2026-11-01T12:00:00Z"
}

export interface Ticket {
  id: number
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  customerId: number
  customerName: string
  customerEmail: string
  // "| null" means a ticket can exist before anyone is assigned to it.
  assignedAgentId: number | null
  assignedAgentName: string | null
  createdAt: string
  updatedAt: string
}

// Pick creates a new type from selected fields, so these can't drift from Ticket.
export type CreateTicketInput = Pick<Ticket, 'title' | 'description' | 'category' | 'priority'>

// Partial makes every field optional, because an update may change only one thing.
export type UpdateTicketInput = Partial<Pick<Ticket, 'title' | 'description' | 'status' | 'assignedAgentId'>>

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

// "mine" means tickets a customer created, or tickets assigned to an agent.
export type TicketScope = 'all' | 'mine'

export interface TicketQuery {
  scope?: TicketScope
  search?: string
  status?: TicketStatus | ''
  priority?: TicketPriority | ''
  page?: number
  limit?: number
  sort?: 'newest' | 'updated'
}

// An empty string means "no filter" for that field.
export interface TicketFilterValues {
  search: string
  status: TicketStatus | ''
  priority: TicketPriority | ''
}

// Named TicketComment because browsers already have a built-in type called Comment.
export interface TicketComment {
  id: number
  ticketId: number
  userId: number
  authorName: string
  message: string
  createdAt: string
}

export interface DashboardStats {
  total: number
  open: number
  inProgress: number
  resolved: number
}

// Every successful API response wraps its result in a "data" field.
export interface ApiResponse<T> {
  data: T
}

export interface AuthResult {
  token: string
  user: User
}

// A generic type: T is a placeholder filled in when it's used,
// so PaginatedResponse<Ticket> has items of type Ticket[].
export interface PaginatedResponse<T> {
  items: T[]
  page: number
  totalPages: number
  totalItems: number
}
