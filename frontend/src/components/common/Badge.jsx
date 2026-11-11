import { priorityLabels, statusLabels } from '../../utils/ticketLabels'

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  green: 'bg-green-50 text-green-700 ring-green-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  orange: 'bg-orange-50 text-orange-800 ring-orange-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  indigo: 'bg-primary-soft text-primary-hover ring-indigo-200',
}

export function Badge({ tone, children }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

const statusTones = {
  open: 'blue',
  in_progress: 'amber',
  resolved: 'green',
}

export function StatusBadge({ status }) {
  return <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>
}

const priorityTones = {
  low: 'slate',
  medium: 'orange',
  high: 'red',
}

export function PriorityBadge({ priority }) {
  return <Badge tone={priorityTones[priority]}>{priorityLabels[priority]}</Badge>
}

const roleDetails = {
  admin: { label: 'Admin', tone: 'indigo' },
  agent: { label: 'Agent', tone: 'blue' },
  customer: { label: 'Customer', tone: 'slate' },
}

export function RoleBadge({ role }) {
  const { label, tone } = roleDetails[role]
  return <Badge tone={tone}>{label}</Badge>
}
