// Data shapes for the API. These match frontend/src/types/index.ts,
// so the frontend receives exactly what it expects.
// IDs are MongoDB ObjectIds, sent as 24-character text.

export type UserRole = 'admin' | 'agent' | 'customer'
export type TicketStatus = 'open' | 'in_progress' | 'resolved'
export type TicketPriority = 'low' | 'medium' | 'high'
export type TicketCategory = 'general' | 'billing' | 'technical' | 'account'

// The only user shape that ever leaves the server. It has no password hash.
export interface PublicUser {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  customerId: string
  customerName: string
  customerEmail: string
  assignedAgentId: string | null
  assignedAgentName: string | null
  createdAt: string
  updatedAt: string
}

export interface TicketComment {
  id: string
  ticketId: string
  userId: string
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

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  totalPages: number
  totalItems: number
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface CreateTicketInput {
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
}

export interface UpdateTicketInput {
  title?: string
  description?: string
  status?: TicketStatus
  assignedAgentId?: string | null
}

export interface TicketQuery {
  scope: 'all' | 'mine'
  search: string
  status?: TicketStatus
  priority?: TicketPriority
  page: number
  limit: number
  sort: 'newest' | 'updated'
}
