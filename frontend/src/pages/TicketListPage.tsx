import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { PriorityBadge, StatusBadge } from '../components/common/Badge'
import { LinkButton } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Pagination } from '../components/common/Pagination'
import { Select } from '../components/common/Select'
import { formatDate } from '../utils/formatDate'
import { paginate, previewTickets } from '../utils/previewData'
import { priorityLabels, statusLabels, ticketPriorities, ticketStatuses } from '../utils/ticketLabels'

const PAGE_SIZE = 5
const tableHeadings = ['Ticket ID', 'Title', 'Customer', 'Assigned Agent', 'Priority', 'Status', 'Created Date', 'Actions']

export function TicketListPage() {
  const [page, setPage] = useState(1)

  // TypeScript knows ticketsOnPage is Ticket[] because paginate is generic.
  const { items: ticketsOnPage, totalPages } = paginate(previewTickets, page, PAGE_SIZE)

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search tickets by title"
            placeholder="Search by title..."
            className="block w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-2 focus:outline-primary/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:flex">
          <Select aria-label="Filter by status" defaultValue="">
            <option value="">All statuses</option>
            {ticketStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </Select>
          <Select aria-label="Filter by priority" defaultValue="">
            <option value="">All priorities</option>
            {ticketPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </Select>
        </div>
        <LinkButton href="#create-ticket" className="whitespace-nowrap">
          <Plus className="size-4" aria-hidden="true" />
          Create Ticket
        </LinkButton>
      </div>

      <Card>
        {/* Wide tables scroll sideways inside the card on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500">
              <tr>
                {tableHeadings.map((heading) => (
                  <th key={heading} scope="col" className="px-5 py-3 font-medium whitespace-nowrap">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ticketsOnPage.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-500 tabular-nums">#{ticket.id}</td>
                  <td className="px-5 py-3 font-medium">{ticket.title}</td>
                  <td className="px-5 py-3 text-slate-600">{ticket.customerName}</td>
                  {/* ?? shows the fallback only when the left side is null or undefined */}
                  <td className="px-5 py-3 text-slate-600">{ticket.assignedAgentName ?? <span className="text-slate-500 italic">Unassigned</span>}</td>
                  <td className="px-5 py-3">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-slate-600">{formatDate(ticket.createdAt)}</td>
                  <td className="px-5 py-3">
                    <a href="#ticket-details" className="font-medium text-primary hover:underline">
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
    </>
  )
}
