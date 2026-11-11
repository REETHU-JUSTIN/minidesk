import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/common/Card'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { TicketForm } from '../components/tickets/TicketForm'
import { createTicket } from '../features/tickets/ticketsSlice'
import { useAppDispatch } from '../store/hooks'

export function CreateTicketPage() {
  const [submitError, setSubmitError] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  async function handleSubmit(values) {
    setSubmitError('')
    try {
      // unwrap gives back the created ticket, or throws if the thunk failed,
      // so normal try/catch works with a dispatched thunk.
      const newTicket = await dispatch(createTicket(values)).unwrap()
      navigate(`/tickets/${newTicket.id}`)
    } catch (caughtError) {
      setSubmitError((caughtError).message ?? 'We couldn\'t create your ticket.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {submitError && <ErrorMessage message={submitError} />}
      <Card title="Ticket details">
        <TicketForm onSubmit={handleSubmit} />
      </Card>
    </div>
  )
}
