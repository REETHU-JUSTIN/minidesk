// TEMPORARY sample data and helpers, so pages work before the backend exists.
// Phase 7 replaces all of this with real API calls and deletes this file.
import type { DashboardStats, PaginatedResponse, Ticket, TicketComment, TicketFilterValues, User } from '../types'

export const previewUsers: User[] = [
  { id: 1, name: 'Alex Morgan', email: 'admin@example.com', role: 'admin', createdAt: '2026-09-01T12:00:00Z' },
  { id: 2, name: 'Sam Carter', email: 'sam@example.com', role: 'agent', createdAt: '2026-09-03T12:00:00Z' },
  { id: 3, name: 'Maya Lee', email: 'maya@example.com', role: 'agent', createdAt: '2026-09-08T12:00:00Z' },
  { id: 4, name: 'Priya Nair', email: 'priya@example.com', role: 'customer', createdAt: '2026-10-02T12:00:00Z' },
  { id: 5, name: 'Liam Walsh', email: 'liam@example.com', role: 'customer', createdAt: '2026-10-09T12:00:00Z' },
  { id: 6, name: 'Noah Kim', email: 'noah@example.com', role: 'customer', createdAt: '2026-10-15T12:00:00Z' },
]

// The signed-in user for now. Phase 4 adds AuthContext and Phase 7 makes login real.
export const previewCurrentUser: User = previewUsers[0]

export const previewTickets: Ticket[] = [
  {
    id: 1008,
    title: 'Cannot download my March invoice',
    description: 'The download button on the billing page does nothing when I click it.',
    category: 'billing',
    priority: 'high',
    status: 'open',
    customerId: 4,
    customerName: 'Priya Nair',
    customerEmail: 'priya@example.com',
    assignedAgentId: 2,
    assignedAgentName: 'Sam Carter',
    createdAt: '2026-11-03T12:00:00Z',
    updatedAt: '2026-11-03T12:00:00Z',
  },
  {
    id: 1007,
    title: 'Password reset link has expired',
    description: 'The reset link in my email says it has expired, even though I just requested it.',
    category: 'account',
    priority: 'medium',
    status: 'open',
    customerId: 5,
    customerName: 'Liam Walsh',
    customerEmail: 'liam@example.com',
    assignedAgentId: null,
    assignedAgentName: null,
    createdAt: '2026-11-02T12:00:00Z',
    updatedAt: '2026-11-02T12:00:00Z',
  },
  {
    id: 1006,
    title: 'App crashes when uploading a file',
    description: 'The app closes without an error message whenever I try to attach a file to a project. I have tried two browsers and see the same result.',
    category: 'technical',
    priority: 'high',
    status: 'in_progress',
    customerId: 4,
    customerName: 'Priya Nair',
    customerEmail: 'priya@example.com',
    assignedAgentId: 3,
    assignedAgentName: 'Maya Lee',
    createdAt: '2026-11-01T12:00:00Z',
    updatedAt: '2026-11-01T15:40:00Z',
  },
  {
    id: 1005,
    title: 'How do I change my billing address?',
    description: 'I moved recently and need to update the address on my invoices.',
    category: 'billing',
    priority: 'low',
    status: 'resolved',
    customerId: 6,
    customerName: 'Noah Kim',
    customerEmail: 'noah@example.com',
    assignedAgentId: 2,
    assignedAgentName: 'Sam Carter',
    createdAt: '2026-10-30T12:00:00Z',
    updatedAt: '2026-10-31T12:00:00Z',
  },
  {
    id: 1004,
    title: 'Team member cannot accept invitation',
    description: 'My colleague gets an error page when opening the invitation link.',
    category: 'account',
    priority: 'medium',
    status: 'in_progress',
    customerId: 5,
    customerName: 'Liam Walsh',
    customerEmail: 'liam@example.com',
    assignedAgentId: 3,
    assignedAgentName: 'Maya Lee',
    createdAt: '2026-10-28T12:00:00Z',
    updatedAt: '2026-10-29T12:00:00Z',
  },
  {
    id: 1003,
    title: 'Charged twice for the same month',
    description: 'My bank statement shows two identical charges for October.',
    category: 'billing',
    priority: 'high',
    status: 'in_progress',
    customerId: 6,
    customerName: 'Noah Kim',
    customerEmail: 'noah@example.com',
    assignedAgentId: 2,
    assignedAgentName: 'Sam Carter',
    createdAt: '2026-10-26T12:00:00Z',
    updatedAt: '2026-10-27T12:00:00Z',
  },
  {
    id: 1002,
    title: 'Export to CSV is missing a column',
    description: 'The exported file no longer includes the project name column.',
    category: 'technical',
    priority: 'low',
    status: 'open',
    customerId: 4,
    customerName: 'Priya Nair',
    customerEmail: 'priya@example.com',
    assignedAgentId: null,
    assignedAgentName: null,
    createdAt: '2026-10-24T12:00:00Z',
    updatedAt: '2026-10-24T12:00:00Z',
  },
  {
    id: 1001,
    title: 'Update the email on my account',
    description: 'Please change my account email to my new work address.',
    category: 'general',
    priority: 'low',
    status: 'resolved',
    customerId: 5,
    customerName: 'Liam Walsh',
    customerEmail: 'liam@example.com',
    assignedAgentId: 3,
    assignedAgentName: 'Maya Lee',
    createdAt: '2026-10-22T12:00:00Z',
    updatedAt: '2026-10-23T12:00:00Z',
  },
]

export const previewComments: TicketComment[] = [
  {
    id: 1,
    ticketId: 1006,
    userId: 4,
    authorName: 'Priya Nair',
    message: 'It happens every time I upload a PDF larger than 5 MB.',
    createdAt: '2026-11-01T12:12:00Z',
  },
  {
    id: 2,
    ticketId: 1006,
    userId: 3,
    authorName: 'Maya Lee',
    message: 'Thanks, Priya. I can reproduce this and I am looking into it now.',
    createdAt: '2026-11-01T15:40:00Z',
  },
]

// In Phase 6, a SQL aggregation query does this job on the server.
export function getDashboardStats(tickets: Ticket[]): DashboardStats {
  const countByStatus = (status: Ticket['status']) => tickets.filter((ticket) => ticket.status === status).length

  return {
    total: tickets.length,
    open: countByStatus('open'),
    inProgress: countByStatus('in_progress'),
    resolved: countByStatus('resolved'),
  }
}

// In Phase 6, SQL WHERE and ILIKE do this job on the server.
export function filterTickets(tickets: Ticket[], filters: TicketFilterValues): Ticket[] {
  const searchText = filters.search.trim().toLowerCase()

  return tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchText)
    const matchesStatus = filters.status === '' || ticket.status === filters.status
    const matchesPriority = filters.priority === '' || ticket.priority === filters.priority
    return matchesSearch && matchesStatus && matchesPriority
  })
}

// <T> makes this generic: it works with a list of anything and keeps the item type.
// In Phase 6, SQL LIMIT and OFFSET do this job on the server.
export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const startIndex = (page - 1) * pageSize

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    page,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    totalItems: items.length,
  }
}
