import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCloseOnOutside } from '../../hooks/useCloseOnOutside'
import { getTickets } from '../../services/ticketService'
import type { Ticket } from '../../types'
import { formatDate } from '../../utils/formatDate'
import { statusLabels } from '../../utils/ticketLabels'
import { Button } from '../common/Button'
import { ErrorMessage } from '../common/ErrorMessage'
import { Spinner } from '../common/Spinner'

// The database has no notifications table, so this lists recently updated tickets.
// It uses local state because no other component needs this data.
export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [error, setError] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useCloseOnOutside(containerRef, isOpen, () => setIsOpen(false))

  // Load fresh updates each time the menu opens.
  useEffect(() => {
    if (!isOpen) return

    // If the menu closes first, ignore the late response.
    let isCancelled = false

    getTickets({ sort: 'updated', limit: 5 })
      .then((result) => {
        if (!isCancelled) setTickets(result.items)
      })
      .catch(() => {
        if (!isCancelled) setError('We couldn\'t load recent updates.')
      })

    return () => {
      isCancelled = true
    }
  }, [isOpen])

  // Clearing the old results belongs here, in the event that causes the change, not in the effect.
  function handleToggle() {
    setTickets(null)
    setError('')
    setIsOpen(!isOpen)
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        className="!p-2"
        aria-label="Recent ticket updates"
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <Bell className="size-5" aria-hidden="true" />
      </Button>

      {isOpen && (
        <div className="absolute top-full -right-12 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg sm:right-0">
          <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">Recent ticket updates</h2>

          {error && (
            <div className="p-3">
              <ErrorMessage message={error} />
            </div>
          )}
          {!error && tickets === null && <Spinner />}
          {tickets?.length === 0 && <p className="px-4 py-6 text-center text-sm text-slate-500">No ticket updates yet.</p>}

          {tickets && tickets.length > 0 && (
            <ul className="divide-y divide-slate-200">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link to={`/tickets/${ticket.id}`} onClick={() => setIsOpen(false)} className="block px-4 py-3 hover:bg-slate-50">
                    <span className="block truncate text-sm font-medium">{ticket.title}</span>
                    <span className="text-xs text-slate-500">
                      {statusLabels[ticket.status]} · {formatDate(ticket.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
