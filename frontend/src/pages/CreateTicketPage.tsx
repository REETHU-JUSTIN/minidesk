import { useState } from 'react'
import { Card } from '../components/common/Card'
import { InfoMessage } from '../components/common/InfoMessage'
import { TicketForm } from '../components/tickets/TicketForm'
import type { CreateTicketInput } from '../types'

export function CreateTicketPage() {
  const [validatedTitle, setValidatedTitle] = useState<string | null>(null)

  // Saving comes in Phase 7. For now, this shows honestly that nothing was saved.
  function handleSubmit(values: CreateTicketInput) {
    setValidatedTitle(values.title)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {validatedTitle && <InfoMessage message={`"${validatedTitle}" passed validation, but it wasn't saved. Saving arrives in Phase 7.`} />}
      <Card title="Ticket details">
        <TicketForm onSubmit={handleSubmit} />
      </Card>
    </div>
  )
}
