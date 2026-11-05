// TEMPORARY in-memory data, deleted in Phase 6 when PostgreSQL takes over.
// All data resets when the server restarts. Passwords are still properly hashed.
import bcrypt from 'bcrypt'
import { env } from '../config/env'
import type { TicketCategory, TicketComment, TicketPriority, TicketStatus, UserRole } from '../types'

// These match the columns the database tables will have.
export interface UserRecord {
  id: number
  name: string
  email: string
  passwordHash: string
  role: UserRole
  createdAt: string
}

export interface TicketRecord {
  id: number
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  customerId: number
  assignedAgentId: number | null
  createdAt: string
  updatedAt: string
}

export type CommentRecord = Omit<TicketComment, 'authorName'>

export const store: { users: UserRecord[]; tickets: TicketRecord[]; comments: CommentRecord[] } = {
  users: [],
  tickets: [],
  comments: [],
}

// Replaces the data with fresh sample data. Called once when the server starts.
export async function initializeStore(): Promise<void> {
  const passwordHash = await bcrypt.hash(env.seedUserPassword, 10)

  store.users = [
    { id: 1, name: 'Alex Morgan', email: 'admin@example.com', passwordHash, role: 'admin', createdAt: '2026-09-01T12:00:00Z' },
    { id: 2, name: 'Sam Carter', email: 'sam@example.com', passwordHash, role: 'agent', createdAt: '2026-09-03T12:00:00Z' },
    { id: 3, name: 'Maya Lee', email: 'maya@example.com', passwordHash, role: 'agent', createdAt: '2026-09-08T12:00:00Z' },
    { id: 4, name: 'Priya Nair', email: 'priya@example.com', passwordHash, role: 'customer', createdAt: '2026-10-02T12:00:00Z' },
    { id: 5, name: 'Liam Walsh', email: 'liam@example.com', passwordHash, role: 'customer', createdAt: '2026-10-09T12:00:00Z' },
    { id: 6, name: 'Noah Kim', email: 'noah@example.com', passwordHash, role: 'customer', createdAt: '2026-10-15T12:00:00Z' },
  ]

  store.tickets = [
    { id: 1008, title: 'Cannot download my March invoice', description: 'The download button on the billing page does nothing when I click it.', category: 'billing', priority: 'high', status: 'open', customerId: 4, assignedAgentId: 2, createdAt: '2026-11-03T12:00:00Z', updatedAt: '2026-11-03T12:00:00Z' },
    { id: 1007, title: 'Password reset link has expired', description: 'The reset link in my email says it has expired, even though I just requested it.', category: 'account', priority: 'medium', status: 'open', customerId: 5, assignedAgentId: null, createdAt: '2026-11-02T12:00:00Z', updatedAt: '2026-11-02T12:00:00Z' },
    { id: 1006, title: 'App crashes when uploading a file', description: 'The app closes without an error message whenever I try to attach a file to a project. I have tried two browsers and see the same result.', category: 'technical', priority: 'high', status: 'in_progress', customerId: 4, assignedAgentId: 3, createdAt: '2026-11-01T12:00:00Z', updatedAt: '2026-11-01T15:40:00Z' },
    { id: 1005, title: 'How do I change my billing address?', description: 'I moved recently and need to update the address on my invoices.', category: 'billing', priority: 'low', status: 'resolved', customerId: 6, assignedAgentId: 2, createdAt: '2026-10-30T12:00:00Z', updatedAt: '2026-10-31T12:00:00Z' },
    { id: 1004, title: 'Team member cannot accept invitation', description: 'My colleague gets an error page when opening the invitation link.', category: 'account', priority: 'medium', status: 'in_progress', customerId: 5, assignedAgentId: 3, createdAt: '2026-10-28T12:00:00Z', updatedAt: '2026-10-29T12:00:00Z' },
    { id: 1003, title: 'Charged twice for the same month', description: 'My bank statement shows two identical charges for October.', category: 'billing', priority: 'high', status: 'in_progress', customerId: 6, assignedAgentId: 2, createdAt: '2026-10-26T12:00:00Z', updatedAt: '2026-10-27T12:00:00Z' },
    { id: 1002, title: 'Export to CSV is missing a column', description: 'The exported file no longer includes the project name column.', category: 'technical', priority: 'low', status: 'open', customerId: 4, assignedAgentId: null, createdAt: '2026-10-24T12:00:00Z', updatedAt: '2026-10-24T12:00:00Z' },
    { id: 1001, title: 'Update the email on my account', description: 'Please change my account email to my new work address.', category: 'general', priority: 'low', status: 'resolved', customerId: 5, assignedAgentId: 3, createdAt: '2026-10-22T12:00:00Z', updatedAt: '2026-10-23T12:00:00Z' },
  ]

  store.comments = [
    { id: 1, ticketId: 1006, userId: 4, message: 'It happens every time I upload a PDF larger than 5 MB.', createdAt: '2026-11-01T12:12:00Z' },
    { id: 2, ticketId: 1006, userId: 3, message: 'Thanks, Priya. I can reproduce this and I am looking into it now.', createdAt: '2026-11-01T15:40:00Z' },
  ]
}
