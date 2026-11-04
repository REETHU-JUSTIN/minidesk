import { CheckCircle2, CircleDot, Clock, Ticket } from 'lucide-react'
import { StatusBadge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { StatCard } from '../components/common/StatCard'
import { previewTickets } from '../utils/previewData'

const totalTickets = previewTickets.length
const countByStatus = (status: string) => previewTickets.filter((ticket) => ticket.status === status).length

const statusOverview = [
  { label: 'Open', count: countByStatus('open'), barColor: 'bg-blue-600' },
  { label: 'In Progress', count: countByStatus('in_progress'), barColor: 'bg-amber-500' },
  { label: 'Resolved', count: countByStatus('resolved'), barColor: 'bg-green-600' },
]

export function DashboardPage() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Tickets" value={totalTickets} icon={Ticket} />
        <StatCard label="Open Tickets" value={statusOverview[0].count} icon={CircleDot} />
        <StatCard label="In Progress Tickets" value={statusOverview[1].count} icon={Clock} />
        <StatCard label="Resolved Tickets" value={statusOverview[2].count} icon={CheckCircle2} />
      </div>

      {/* grid-cols-1 stops long truncated titles from stretching the column on phones */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Recent Tickets" className="xl:col-span-2">
          <ul className="divide-y divide-slate-200">
            {previewTickets.slice(0, 5).map((ticket) => (
              <li key={ticket.id}>
                <a href="#ticket-details" className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{ticket.title}</span>
                    <span className="text-xs text-slate-500">
                      #{ticket.id} · {ticket.customer} · {ticket.createdAt}
                    </span>
                  </span>
                  <StatusBadge status={ticket.status} />
                </a>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Ticket Status Overview">
          <ul className="space-y-5 p-5">
            {statusOverview.map(({ label, count, barColor }) => {
              const percent = totalTickets === 0 ? 0 : Math.round((count / totalTickets) * 100)
              return (
                <li key={label} title={`${label}: ${count} of ${totalTickets} tickets`}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-slate-500 tabular-nums">
                      {count} ({percent}%)
                    </span>
                  </div>
                  {/* The text above carries the numbers, so screen readers can skip this bar */}
                  <div className="h-2 rounded-full bg-slate-100" aria-hidden="true">
                    <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </>
  )
}
