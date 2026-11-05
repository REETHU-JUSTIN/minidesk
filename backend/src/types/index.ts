// Data shapes for the API. These match frontend/src/types/index.ts,
// so the frontend receives exactly what it expects.

export type UserRole = 'admin' | 'agent' | 'customer'
export type TicketStatus = 'open' | 'in_progress' | 'resolved'
export type TicketPriority = 'low' | 'medium' | 'high'
export type TicketCategory = 'general' | 'billing' | 'technical' | 'account'

// The only user shape that ever leaves the server. It has no password hash.
export interface PublicUser {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt: string
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
  assignedAgentId: number | null
  assignedAgentName: string | null
  createdAt: string
  updatedAt: string
}

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
  assignedAgentId?: number | null
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
