// Every status and priority needs a label here, or it would show as blank.
export const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

export const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const categoryLabels = {
  general: 'General',
  billing: 'Billing',
  technical: 'Technical',
  account: 'Account',
}

// These arrays set the order of the options in dropdowns.
export const ticketStatuses = ['open', 'in_progress', 'resolved']
export const ticketPriorities = ['low', 'medium', 'high']
export const ticketCategories = ['general', 'billing', 'technical', 'account']
