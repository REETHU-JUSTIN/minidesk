import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PriorityBadge, StatusBadge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { Modal } from '../components/common/Modal'
import { Spinner } from '../components/common/Spinner'
import { TicketComments } from '../components/tickets/TicketComments'
import { TicketEditForm } from '../components/tickets/TicketEditForm'
import { TicketManagePanel } from '../components/tickets/TicketManagePanel'
import { deleteTicket, fetchTicketById, updateTicket } from '../features/tickets/ticketsSlice'
import { useCurrentUser } from '../hooks/useAuth'
import { getUsers } from '../services/userService'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { Ticket, UpdateTicketInput, User } from '../types'
import { formatDate } from '../utils/formatDate'
import { formatTicketId } from '../utils/formatTicketId'
import { categoryLabels } from '../utils/ticketLabels'

// A MongoDB ObjectId: 24 hexadecimal characters.
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i

export function TicketDetailsPage() {
  // useParams reads :ticketId from the URL. Anyone can type anything there, so it's checked first.
  const { ticketId } = useParams()

  if (!ticketId || !OBJECT_ID_PATTERN.test(ticketId)) {
    return <ErrorMessage message="We couldn't find that ticket." />
  }

  // The key gives each ticket a fresh component, so nothing carries over between tickets.
  return <TicketDetailsLoader key={ticketId} ticketId={ticketId} />
}

function TicketDetailsLoader({ ticketId }: { ticketId: string }) {
  const dispatch = useAppDispatch()
  const { selectedTicket, detailStatus, detailError } = useAppSelector((state) => state.tickets)

  useEffect(() => {
    const request = dispatch(fetchTicketById(ticketId))
    return () => request.abort()
  }, [dispatch, ticketId])

  if (detailStatus === 'failed') {
    return <ErrorMessage message={detailError ?? 'We couldn\'t load that ticket.'} />
  }

  // Hooks must run in the same order on every render, so they can't come after an early return.
  // TicketDetails only renders once the right ticket has loaded. The id check also
  // stops the previously viewed ticket from flashing up.
  if (selectedTicket?.id !== ticketId) {
    return <Spinner label="Loading ticket..." />
  }

  return <TicketDetails ticket={selectedTicket} />
}

function TicketDetails({ ticket }: { ticket: Ticket }) {
  const currentUser = useCurrentUser()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [agents, setAgents] = useState<User[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { role } = currentUser
  const canManage = role === 'admin' || role === 'agent'
  const canEdit = role === 'admin' || (role === 'customer' && ticket.status === 'open')

  // Modal's effect depends on onClose. Stable functions stop that effect from
  // re-running, and pulling keyboard focus back, whenever this page re-renders.
  const closeEditModal = useCallback(() => setIsEditOpen(false), [])
  const closeDeleteModal = useCallback(() => setIsDeleteOpen(false), [])

  // Only admins may list users, so only they request the agent list.
  useEffect(() => {
    if (role !== 'admin') return

    let isCancelled = false
    getUsers('agent')
      .then((loadedAgents) => {
        if (!isCancelled) setAgents(loadedAgents)
      })
      .catch((caughtError: Error) => {
        if (!isCancelled) setActionError(caughtError.message)
      })

    return () => {
      isCancelled = true
    }
  }, [role])

  async function saveChanges(changes: UpdateTicketInput) {
    setIsSaving(true)
    setActionError('')
    try {
      await dispatch(updateTicket({ ticketId: ticket.id, changes })).unwrap()
    } catch (caughtError) {
      setActionError((caughtError as Error).message ?? 'We couldn\'t save your changes.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleEditSave(values: { title: string; description: string }) {
    await saveChanges(values)
    closeEditModal()
  }

  async function handleDelete() {
    setIsDeleting(true)
    setActionError('')
    try {
      await dispatch(deleteTicket(ticket.id)).unwrap()
      navigate('/tickets', { replace: true })
    } catch (caughtError) {
      setActionError((caughtError as Error).message ?? 'We couldn\'t delete this ticket.')
      setIsDeleting(false)
      closeDeleteModal()
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        {actionError && <ErrorMessage message={actionError} />}

        <Card>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-slate-500 tabular-nums">
                  {formatTicketId(ticket.id)} · {categoryLabels[ticket.category]}
                </p>
                <h2 className="mt-1 text-xl font-semibold break-words">{ticket.title}</h2>
              </div>
              {canEdit && (
                <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
                  Edit
                </Button>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <p className="mt-4 text-sm leading-6 whitespace-pre-line text-slate-700">{ticket.description}</p>
          </div>
        </Card>

        <TicketComments ticketId={ticket.id} />
      </div>

      <div className="space-y-6">
        {canManage && (
          <TicketManagePanel
            ticket={ticket}
            currentUser={currentUser}
            agents={agents}
            isSaving={isSaving}
            onStatusChange={(status) => saveChanges({ status })}
            onAgentChange={(assignedAgentId) => saveChanges({ assignedAgentId })}
            onDeleteClick={() => setIsDeleteOpen(true)}
          />
        )}

        <Card title="People">
          <dl className="space-y-3 p-5 text-sm">
            <div>
              <dt className="text-slate-500">Customer</dt>
              <dd className="font-medium">{ticket.customerName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Customer email</dt>
              <dd className="font-medium break-words">{ticket.customerEmail}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Assigned agent</dt>
              <dd className="font-medium">{ticket.assignedAgentName ?? 'Unassigned'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Created</dt>
              <dd className="font-medium">{formatDate(ticket.createdAt)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Modal isOpen={isEditOpen} title="Edit ticket" onClose={closeEditModal}>
        <TicketEditForm
          initialValues={{ title: ticket.title, description: ticket.description }}
          onSave={handleEditSave}
          onCancel={closeEditModal}
        />
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        title="Delete this ticket?"
        onClose={closeDeleteModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              Delete Ticket
            </Button>
          </>
        }
      >
        This permanently deletes ticket {formatTicketId(ticket.id)} and all of its comments. This can't be undone.
      </Modal>
    </div>
  )
}
