import type { TicketStatus, User } from '../../types'
import { statusLabels, ticketStatuses } from '../../utils/ticketLabels'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { Select } from '../common/Select'

interface TicketManagePanelProps {
  status: TicketStatus
  assignedAgentId: number | null
  agents: User[]
  onStatusChange: (status: TicketStatus) => void
  onAgentChange: (agentId: number | null) => void
  onDeleteClick: () => void
}

export function TicketManagePanel({ status, assignedAgentId, agents, onStatusChange, onAgentChange, onDeleteClick }: TicketManagePanelProps) {
  return (
    <Card title="Manage">
      <div className="space-y-4 p-5">
        <Select
          id="status"
          label="Status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as TicketStatus)}
        >
          {ticketStatuses.map((option) => (
            <option key={option} value={option}>
              {statusLabels[option]}
            </option>
          ))}
        </Select>

        {/* HTML values are always text, so "no agent" becomes '' here and null in our state */}
        <Select
          id="agent"
          label="Assigned agent"
          value={assignedAgentId ?? ''}
          onChange={(event) => onAgentChange(event.target.value === '' ? null : Number(event.target.value))}
        >
          <option value="">Unassigned</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </Select>

        <Button variant="danger" className="w-full" onClick={onDeleteClick}>
          Delete Ticket
        </Button>
      </div>
    </Card>
  )
}
