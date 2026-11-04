import type { ReactNode } from 'react'

export type TicketStatus = 'open' | 'in_progress' | 'resolved'
export type TicketPriority = 'low' | 'medium' | 'high'
export type UserRole = 'admin' | 'agent' | 'customer'

type BadgeTone = 'blue' | 'amber' | 'green' | 'slate' | 'orange' | 'red' | 'indigo'

const toneClasses: Record<BadgeTone, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  green: 'bg-green-50 text-green-700 ring-green-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  orange: 'bg-orange-50 text-orange-800 ring-orange-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  indigo: 'bg-primary-soft text-primary-hover ring-indigo-200',
}

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

const statusDetails: Record<TicketStatus, { label: string; tone: BadgeTone }> = {
  open: { label: 'Open', tone: 'blue' },
  in_progress: { label: 'In Progress', tone: 'amber' },
  resolved: { label: 'Resolved', tone: 'green' },
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const { label, tone } = statusDetails[status]
  return <Badge tone={tone}>{label}</Badge>
}

const priorityDetails: Record<TicketPriority, { label: string; tone: BadgeTone }> = {
  low: { label: 'Low', tone: 'slate' },
  medium: { label: 'Medium', tone: 'orange' },
  high: { label: 'High', tone: 'red' },
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const { label, tone } = priorityDetails[priority]
  return <Badge tone={tone}>{label}</Badge>
}

const roleDetails: Record<UserRole, { label: string; tone: BadgeTone }> = {
  admin: { label: 'Admin', tone: 'indigo' },
  agent: { label: 'Agent', tone: 'blue' },
  customer: { label: 'Customer', tone: 'slate' },
}

export function RoleBadge({ role }: { role: UserRole }) {
  const { label, tone } = roleDetails[role]
  return <Badge tone={tone}>{label}</Badge>
}
