import { useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useCloseOnOutside } from '../../hooks/useCloseOnOutside'
import { formatDate } from '../../utils/formatDate'
import { previewTickets } from '../../utils/previewData'
import { statusLabels } from '../../utils/ticketLabels'
import { Button } from '../common/Button'

// The database has no notifications table, so this lists recently updated tickets.
export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useCloseOnOutside(containerRef, isOpen, () => setIsOpen(false))

  // sort changes the array it's called on, so we sort a copy made with spread.
  const recentlyUpdated = [...previewTickets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        className="!p-2"
        aria-label="Recent ticket updates"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="size-5" aria-hidden="true" />
      </Button>

      {isOpen && (
        <div className="absolute top-full -right-12 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg sm:right-0">
          <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">Recent ticket updates</h2>
          <ul className="divide-y divide-slate-200">
            {recentlyUpdated.map((ticket) => (
              <li key={ticket.id}>
                <a href="#ticket-details" onClick={() => setIsOpen(false)} className="block px-4 py-3 hover:bg-slate-50">
                  <span className="block truncate text-sm font-medium">{ticket.title}</span>
                  <span className="text-xs text-slate-500">
                    {statusLabels[ticket.status]} · {formatDate(ticket.updatedAt)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
