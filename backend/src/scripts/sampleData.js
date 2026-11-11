// Sample data for LOCAL DEVELOPMENT ONLY. Never load this on a deployed database.
import { Types } from 'mongoose'

// Every sample account uses this password. It's public, so these accounts must stay local.
export const DEMO_PASSWORD = 'MiniDesk-Demo-2026'

// Fixed IDs make the sample data predictable: user 4 and ticket 1006 are always the same.
function fixedId(number) {
  return new Types.ObjectId(String(number).padStart(24, '0'))
}

export const userId = fixedId
export const ticketId = fixedId

const person = (id, name, email, role, createdAt) => ({
  _id: fixedId(id),
  name,
  email,
  role,
  createdAt: new Date(createdAt),
})

export const sampleUsers = [
  person(1, 'Alex Morgan', 'admin@example.com', 'admin', '2026-09-01T12:00:00Z'),
  person(2, 'Sam Carter', 'sam@example.com', 'agent', '2026-09-03T12:00:00Z'),
  person(3, 'Maya Lee', 'maya@example.com', 'agent', '2026-09-08T12:00:00Z'),
  person(4, 'Priya Nair', 'priya@example.com', 'customer', '2026-10-02T12:00:00Z'),
  person(5, 'Liam Walsh', 'liam@example.com', 'customer', '2026-10-09T12:00:00Z'),
  person(6, 'Noah Kim', 'noah@example.com', 'customer', '2026-10-15T12:00:00Z'),
]

const tickets = [
  { id: 1001, title: 'Update the email on my account', description: 'Please change my account email to my new work address.', category: 'general', priority: 'low', status: 'resolved', customer: 5, agent: 3, createdAt: '2026-10-22T12:00:00Z', updatedAt: '2026-10-23T12:00:00Z' },
  { id: 1002, title: 'Export to CSV is missing a column', description: 'The exported file no longer includes the project name column.', category: 'technical', priority: 'low', status: 'open', customer: 4, agent: null, createdAt: '2026-10-24T12:00:00Z', updatedAt: '2026-10-24T12:00:00Z' },
  { id: 1003, title: 'Charged twice for the same month', description: 'My bank statement shows two identical charges for October.', category: 'billing', priority: 'high', status: 'in_progress', customer: 6, agent: 2, createdAt: '2026-10-26T12:00:00Z', updatedAt: '2026-10-27T12:00:00Z' },
  { id: 1004, title: 'Team member cannot accept invitation', description: 'My colleague gets an error page when opening the invitation link.', category: 'account', priority: 'medium', status: 'in_progress', customer: 5, agent: 3, createdAt: '2026-10-28T12:00:00Z', updatedAt: '2026-10-29T12:00:00Z' },
  { id: 1005, title: 'How do I change my billing address?', description: 'I moved recently and need to update the address on my invoices.', category: 'billing', priority: 'low', status: 'resolved', customer: 6, agent: 2, createdAt: '2026-10-30T12:00:00Z', updatedAt: '2026-10-31T12:00:00Z' },
  {
    id: 1006,
    title: 'App crashes when uploading a file',
    description: 'The app closes without an error message whenever I try to attach a file to a project. I have tried two browsers and see the same result.',
    category: 'technical',
    priority: 'high',
    status: 'in_progress',
    customer: 4,
    agent: 3,
    createdAt: '2026-11-01T12:00:00Z',
    updatedAt: '2026-11-01T15:40:00Z',
    comments: [
      { id: 1, author: 4, message: 'It happens every time I upload a PDF larger than 5 MB.', createdAt: '2026-11-01T12:12:00Z' },
      { id: 2, author: 3, message: 'Thanks, Priya. I can reproduce this and I am looking into it now.', createdAt: '2026-11-01T15:40:00Z' },
    ],
  },
  { id: 1007, title: 'Password reset link has expired', description: 'The reset link in my email says it has expired, even though I just requested it.', category: 'account', priority: 'medium', status: 'open', customer: 5, agent: null, createdAt: '2026-11-02T12:00:00Z', updatedAt: '2026-11-02T12:00:00Z' },
  { id: 1008, title: 'Cannot download my March invoice', description: 'The download button on the billing page does nothing when I click it.', category: 'billing', priority: 'high', status: 'open', customer: 4, agent: 2, createdAt: '2026-11-03T12:00:00Z', updatedAt: '2026-11-03T12:00:00Z' },
]

export const sampleTickets = tickets.map((ticket) => ({
  _id: fixedId(ticket.id),
  title: ticket.title,
  description: ticket.description,
  category: ticket.category,
  priority: ticket.priority,
  status: ticket.status,
  customer: fixedId(ticket.customer),
  assignedAgent: ticket.agent === null ? null : fixedId(ticket.agent),
  createdAt: new Date(ticket.createdAt),
  updatedAt: new Date(ticket.updatedAt),
  comments: (ticket.comments ?? []).map((comment) => ({
    _id: fixedId(comment.id),
    author: fixedId(comment.author),
    message: comment.message,
    createdAt: new Date(comment.createdAt),
  })),
}))
