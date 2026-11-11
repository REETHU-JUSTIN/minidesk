import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/formatDate'
import { formatTicketId } from '../../utils/formatTicketId'
import { PriorityBadge, StatusBadge } from '../common/Badge'

const tableHeadings = ['Ticket ID', 'Title', 'Customer', 'Assigned Agent', 'Priority', 'Status', 'Created Date', 'Actions']

export function TicketTable({ tickets }) {
  return (
    // Wide tables scroll sideways inside the card on small screens
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
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 text-slate-500 tabular-nums">{formatTicketId(ticket.id)}</td>
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
                <Link to={`/tickets/${ticket.id}`} className="font-medium text-primary hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
