import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getComments, getTicketById } from '../services/ticketService'
import { customerUser, makeTicket, renderWithProviders } from '../test/testUtils'
import { TicketDetailsPage } from './TicketDetailsPage'

vi.mock('../services/ticketService')
const mockGetTicketById = vi.mocked(getTicketById)

const VALID_ID = '000000000000000000001006'

function renderAt(id: string) {
  renderWithProviders(
    <Routes>
      <Route path="/tickets/:ticketId" element={<TicketDetailsPage />} />
    </Routes>,
    { route: `/tickets/${id}`, auth: { user: customerUser } },
  )
}

describe('TicketDetailsPage', () => {
  beforeEach(() => {
    mockGetTicketById.mockResolvedValue(makeTicket())
    vi.mocked(getComments).mockResolvedValue([])
  })

  it('loads the ticket from the URL', async () => {
    renderAt(VALID_ID)

    expect(await screen.findByRole('heading', { name: 'App crashes when uploading a file' })).toBeInTheDocument()
    expect(mockGetTicketById.mock.lastCall?.[0]).toBe(VALID_ID)
  })

  it.each(['abc', '1006', 'g'.repeat(24)])('rejects the badly formed ID %s without calling the API', (id) => {
    renderAt(id)

    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't find that ticket.")
    expect(mockGetTicketById).not.toHaveBeenCalled()
  })
})
