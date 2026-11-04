import { useState } from 'react'
import { PriorityBadge, StatusBadge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { Modal } from '../components/common/Modal'
import { Select } from '../components/common/Select'
import { Textarea } from '../components/common/Textarea'
import { formatDate, formatDateTime } from '../utils/formatDate'
import { previewComments, previewTickets, previewUsers } from '../utils/previewData'
import { categoryLabels, statusLabels, ticketStatuses } from '../utils/ticketLabels'

// A fixed ticket for now. Phase 4 reads the id from the URL.
const PREVIEW_TICKET_ID = 1006

export function TicketDetailsPage() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // find returns the ticket, or undefined if nothing matches.
  const ticket = previewTickets.find((item) => item.id === PREVIEW_TICKET_ID)

  // TypeScript requires this check. After it, it knows that ticket can't be undefined.
  if (!ticket) {
    return <ErrorMessage message="We couldn't find that ticket." />
  }

  const comments = previewComments.filter((comment) => comment.ticketId === ticket.id)
  const agents = previewUsers.filter((user) => user.role === 'agent')

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Card>
          <div className="p-5">
            <p className="text-sm text-slate-500 tabular-nums">
              #{ticket.id} · {categoryLabels[ticket.category]}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{ticket.title}</h2>
            <div className="mt-3 flex gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{ticket.description}</p>
          </div>
        </Card>

        <Card title={`Comments (${comments.length})`}>
          <ul className="divide-y divide-slate-200">
            {comments.map((comment) => (
              <li key={comment.id} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="text-sm font-medium">{comment.authorName}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</p>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">{comment.message}</p>
              </li>
            ))}
          </ul>
          <form className="space-y-3 border-t border-slate-200 p-5" onSubmit={(event) => event.preventDefault()}>
            <Textarea id="comment" label="Add a comment" rows={3} placeholder="Write your reply..." />
            <div className="flex justify-end">
              <Button type="submit">Post Comment</Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Manage">
          <div className="space-y-4 p-5">
            <Select id="status" label="Status" defaultValue={ticket.status}>
              {ticketStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </Select>
            {/* An unassigned ticket has a null agent id, so ?? selects the "Unassigned" option */}
            <Select id="agent" label="Assigned agent" defaultValue={ticket.assignedAgentId ?? ''}>
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </Select>
            <Button variant="danger" className="w-full" onClick={() => setIsDeleteOpen(true)}>
              Delete Ticket
            </Button>
          </div>
        </Card>

        <Card title="Customer">
          <dl className="space-y-3 p-5 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium">{ticket.customerName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium">{ticket.customerEmail}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Created</dt>
              <dd className="font-medium">{formatDate(ticket.createdAt)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Modal
        isOpen={isDeleteOpen}
        title="Delete this ticket?"
        onClose={() => setIsDeleteOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setIsDeleteOpen(false)}>
              Delete Ticket
            </Button>
          </>
        }
      >
        This permanently deletes ticket #{ticket.id} and all of its comments. This can't be undone.
      </Modal>
    </div>
  )
}
