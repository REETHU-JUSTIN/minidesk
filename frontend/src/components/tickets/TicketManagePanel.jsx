import { statusLabels, ticketStatuses } from '../../utils/ticketLabels'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { Select } from '../common/Select'

// Shown to admins and agents only. Admins can assign anyone and delete,
// while agents can only assign tickets to themselves.
export function TicketManagePanel({ ticket, currentUser, agents, isSaving, onStatusChange, onAgentChange, onDeleteClick }) {
  const isAdmin = currentUser.role === 'admin'
  const isAssignedToMe = ticket.assignedAgentId === currentUser.id

  return (
    <Card title="Manage">
      <div className="space-y-4 p-5">
        <Select
          id="status"
          label="Status"
          value={ticket.status}
          disabled={isSaving}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          {ticketStatuses.map((option) => (
            <option key={option} value={option}>
              {statusLabels[option]}
            </option>
          ))}
        </Select>

        {isAdmin && (
          // HTML values are always text, so "no agent" becomes '' here and null in our data.
          <Select
            id="agent"
            label="Assigned agent"
            value={ticket.assignedAgentId ?? ''}
            disabled={isSaving}
            onChange={(event) => onAgentChange(event.target.value === '' ? null : event.target.value)}
          >
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </Select>
        )}

        {!isAdmin && !isAssignedToMe && (
          <Button variant="secondary" className="w-full" disabled={isSaving} onClick={() => onAgentChange(currentUser.id)}>
            Assign to Me
          </Button>
        )}

        {isAdmin && (
          <Button variant="danger" className="w-full" onClick={onDeleteClick}>
            Delete Ticket
          </Button>
        )}
      </div>
    </Card>
  )
}
