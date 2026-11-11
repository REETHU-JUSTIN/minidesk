import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createTicket } from '../services/ticketService'
import { customerUser, makeTicket, renderWithProviders } from '../test/testUtils'
import { CreateTicketPage } from './CreateTicketPage'

vi.mock('../services/ticketService')
const mockCreateTicket = vi.mocked(createTicket)

async function fillAndSubmit() {
  const user = userEvent.setup()
  renderWithProviders(
    <Routes>
      <Route path="/tickets/new" element={<CreateTicketPage />} />
      <Route path="/tickets/:id" element={<p>Opened the new ticket</p>} />
    </Routes>,
    { route: '/tickets/new', auth: { user: customerUser } },
  )
  await user.type(screen.getByLabelText('Ticket title'), 'Printer is on fire')
  await user.type(screen.getByLabelText('Description'), 'Smoke is coming out of it.')
  await user.click(screen.getByRole('button', { name: 'Create Ticket' }))
}

describe('CreateTicketPage', () => {
  it('creates the ticket, then opens it', async () => {
    mockCreateTicket.mockResolvedValue(makeTicket({ id: '000000000000000000001009' }))

    await fillAndSubmit()

    expect(await screen.findByText('Opened the new ticket')).toBeInTheDocument()
    expect(mockCreateTicket).toHaveBeenCalledWith({
      title: 'Printer is on fire',
      description: 'Smoke is coming out of it.',
      category: 'general',
      priority: 'medium',
    })
  })

  it('stays on the page and shows the error when creating fails', async () => {
    mockCreateTicket.mockRejectedValue(new Error('Title must be 5 to 120 characters.'))

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Title must be 5 to 120 characters.')
    await waitFor(() => expect(screen.getByLabelText('Ticket title')).toHaveValue('Printer is on fire'))
  })
})
