import type { TicketCategory, TicketPriority, TicketStatus } from '../types'

// Record forces one label per allowed value. Adding a new status to the union
// causes a compile error here until its label is added too.
export const statusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

export const priorityLabels: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const categoryLabels: Record<TicketCategory, string> = {
  general: 'General',
  billing: 'Billing',
  technical: 'Technical',
  account: 'Account',
}

// These arrays set the order of the options in dropdowns.
export const ticketStatuses: TicketStatus[] = ['open', 'in_progress', 'resolved']
export const ticketPriorities: TicketPriority[] = ['low', 'medium', 'high']
export const ticketCategories: TicketCategory[] = ['general', 'billing', 'technical', 'account']
