import { useCallback, useState } from 'react'
import { PriorityBadge, StatusBadge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { Modal } from '../components/common/Modal'
import { CommentForm } from '../components/tickets/CommentForm'
import { CommentList } from '../components/tickets/CommentList'
import { TicketManagePanel } from '../components/tickets/TicketManagePanel'
import type { Ticket, TicketStatus } from '../types'
import { formatDate } from '../utils/formatDate'
import { previewComments, previewCurrentUser, previewTickets, previewUsers } from '../utils/previewData'
import { categoryLabels } from '../utils/ticketLabels'

// A fixed ticket for now. Phase 4 reads the id from the URL.
const PREVIEW_TICKET_ID = 1006

const agents = previewUsers.filter((user) => user.role === 'agent')

export function TicketDetailsPage() {
  const ticket = previewTickets.find((item) => item.id === PREVIEW_TICKET_ID)

  // Hooks must run in the same order on every render, so they can't come after an early return.
  // Moving the hooks into a child component that only renders when the ticket exists solves this.
  if (!ticket) {
    return <ErrorMessage message="We couldn't find that ticket." />
  }

  return <TicketDetails ticket={ticket} />
}

function TicketDetails({ ticket }: { ticket: Ticket }) {
  // These changes last until the page reloads. Phase 7 saves them through the API.
  const [status, setStatus] = useState<TicketStatus>(ticket.status)
  const [assignedAgentId, setAssignedAgentId] = useState(ticket.assignedAgentId)
  const [comments, setComments] = useState(() => previewComments.filter((comment) => comment.ticketId === ticket.id))
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Modal's effect depends on onClose. A stable function stops that effect from
  // re-running, and pulling keyboard focus back, whenever this page re-renders.
  const closeDeleteModal = useCallback(() => setIsDeleteOpen(false), [])

  function handleAddComment(message: string) {
    const newComment = {
      id: Date.now(), // a temporary id, until the database creates real ones
      ticketId: ticket.id,
      userId: previewCurrentUser.id,
      authorName: previewCurrentUser.name,
      message,
      createdAt: new Date().toISOString(),
    }
    // State is never changed directly. We create a new array, and React sees the change.
    setComments((currentComments) => [...currentComments, newComment])
  }

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
              <StatusBadge status={status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{ticket.description}</p>
          </div>
        </Card>

        <Card title={`Comments (${comments.length})`}>
          <CommentList comments={comments} />
          <CommentForm onAddComment={handleAddComment} />
        </Card>
      </div>

      <div className="space-y-6">
        <TicketManagePanel
          status={status}
          assignedAgentId={assignedAgentId}
          agents={agents}
          onStatusChange={setStatus}
          onAgentChange={setAssignedAgentId}
          onDeleteClick={() => setIsDeleteOpen(true)}
        />

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
        onClose={closeDeleteModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={closeDeleteModal}>
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
