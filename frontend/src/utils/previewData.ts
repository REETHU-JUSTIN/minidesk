// TEMPORARY sample data so page layouts can be seen before the backend exists.
// Phase 7 replaces this with real API data and deletes this file.
import type { TicketPriority, TicketStatus, UserRole } from '../components/common/Badge'

export interface PreviewTicket {
  id: number
  title: string
  customer: string
  agent: string | null
  priority: TicketPriority
  status: TicketStatus
  createdAt: string
}

export const previewTickets: PreviewTicket[] = [
  { id: 1008, title: 'Cannot download my March invoice', customer: 'Priya Nair', agent: 'Sam Carter', priority: 'high', status: 'open', createdAt: 'Nov 3, 2026' },
  { id: 1007, title: 'Password reset link has expired', customer: 'Liam Walsh', agent: null, priority: 'medium', status: 'open', createdAt: 'Nov 2, 2026' },
  { id: 1006, title: 'App crashes when uploading a file', customer: 'Priya Nair', agent: 'Maya Lee', priority: 'high', status: 'in_progress', createdAt: 'Nov 1, 2026' },
  { id: 1005, title: 'How do I change my billing address?', customer: 'Noah Kim', agent: 'Sam Carter', priority: 'low', status: 'resolved', createdAt: 'Oct 30, 2026' },
  { id: 1004, title: 'Team member cannot accept invitation', customer: 'Liam Walsh', agent: 'Maya Lee', priority: 'medium', status: 'in_progress', createdAt: 'Oct 28, 2026' },
  { id: 1003, title: 'Charged twice for the same month', customer: 'Noah Kim', agent: 'Sam Carter', priority: 'high', status: 'in_progress', createdAt: 'Oct 26, 2026' },
  { id: 1002, title: 'Export to CSV is missing a column', customer: 'Priya Nair', agent: null, priority: 'low', status: 'open', createdAt: 'Oct 24, 2026' },
  { id: 1001, title: 'Update the email on my account', customer: 'Liam Walsh', agent: 'Maya Lee', priority: 'low', status: 'resolved', createdAt: 'Oct 22, 2026' },
]

export interface PreviewUser {
  id: number
  name: string
  email: string
  role: UserRole
  joined: string
}

export const previewUsers: PreviewUser[] = [
  { id: 1, name: 'Alex Morgan', email: 'admin@example.com', role: 'admin', joined: 'Sep 1, 2026' },
  { id: 2, name: 'Sam Carter', email: 'sam@example.com', role: 'agent', joined: 'Sep 3, 2026' },
  { id: 3, name: 'Maya Lee', email: 'maya@example.com', role: 'agent', joined: 'Sep 8, 2026' },
  { id: 4, name: 'Priya Nair', email: 'priya@example.com', role: 'customer', joined: 'Oct 2, 2026' },
  { id: 5, name: 'Liam Walsh', email: 'liam@example.com', role: 'customer', joined: 'Oct 9, 2026' },
  { id: 6, name: 'Noah Kim', email: 'noah@example.com', role: 'customer', joined: 'Oct 15, 2026' },
]
