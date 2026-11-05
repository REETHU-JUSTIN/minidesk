import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getTickets } from '../services/ticketService'
import { adminUser, customerUser, makeTicket, renderWithProviders } from '../test/testUtils'
import type { PaginatedResponse, Ticket } from '../types'
import { TicketListPage } from './TicketListPage'

// Replaces the real service, so these tests need no server.
vi.mock('../services/ticketService')
const mockGetTickets = vi.mocked(getTickets)

function pageOf(items: Ticket[], overrides: Partial<PaginatedResponse<Ticket>> = {}): PaginatedResponse<Ticket> {
  return { items, page: 1, totalPages: 1, totalItems: items.length, ...overrides }
}

const lastQuery = () => mockGetTickets.mock.lastCall?.[0]

describe('TicketListPage', () => {
  beforeEach(() => {
    mockGetTickets.mockResolvedValue(pageOf([makeTicket()]))
  })

  describe('rendering', () => {
    it('shows a loading message, then the tickets', async () => {
      renderWithProviders(<TicketListPage scope="all" />)

      expect(screen.getByText('Loading tickets...')).toBeInTheDocument()

      const row = (await screen.findByText('App crashes when uploading a file')).closest('tr') as HTMLElement
      expect(within(row).getByText('#1006')).toBeInTheDocument()
      expect(within(row).getByText('Priya Nair')).toBeInTheDocument()
      expect(within(row).getByText('Maya Lee')).toBeInTheDocument()
      expect(within(row).getByText('High')).toBeInTheDocument()
      expect(within(row).getByText('In Progress')).toBeInTheDocument()
      expect(within(row).getByRole('link', { name: 'View' })).toHaveAttribute('href', '/tickets/1006')
    })

    it('shows "Unassigned" for a ticket with no agent', async () => {
      mockGetTickets.mockResolvedValue(pageOf([makeTicket({ assignedAgentId: null, assignedAgentName: null })]))
      renderWithProviders(<TicketListPage scope="all" />)

      expect(await screen.findByText('Unassigned')).toBeInTheDocument()
    })

    it('explains when there are no tickets', async () => {
      mockGetTickets.mockResolvedValue(pageOf([]))
      renderWithProviders(<TicketListPage scope="all" />)

      expect(await screen.findByText('No tickets here yet.')).toBeInTheDocument()
    })

    it('shows the error when loading fails', async () => {
      mockGetTickets.mockRejectedValue(new Error('We can\'t reach the server.'))
      renderWithProviders(<TicketListPage scope="all" />)

      expect(await screen.findByRole('alert')).toHaveTextContent('We can\'t reach the server.')
    })

    it('offers Create Ticket to customers only', async () => {
      const first = renderWithProviders(<TicketListPage scope="mine" />, { auth: { user: customerUser } })
      await screen.findByText('App crashes when uploading a file')
      expect(screen.getByRole('link', { name: 'Create Ticket' })).toBeInTheDocument()
      first.unmount()

      renderWithProviders(<TicketListPage scope="all" />, { auth: { user: adminUser } })
      await screen.findByText('App crashes when uploading a file')
      expect(screen.queryByRole('link', { name: 'Create Ticket' })).not.toBeInTheDocument()
    })
  })

  describe('search and filtering', () => {
    it('requests the right list for the page', async () => {
      renderWithProviders(<TicketListPage scope="mine" />)

      await waitFor(() => expect(lastQuery()).toMatchObject({ scope: 'mine', page: 1, limit: 5, search: '', status: '', priority: '' }))
    })

    it('sends one request after typing stops, rather than one per keystroke', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TicketListPage scope="all" />)
      await screen.findByText('App crashes when uploading a file')
      mockGetTickets.mockClear()

      await user.type(screen.getByLabelText('Search tickets by title'), 'invoice')

      await waitFor(() => expect(lastQuery()).toMatchObject({ search: 'invoice' }))
      expect(mockGetTickets).toHaveBeenCalledTimes(1)
    })

    it('filters by status and priority together', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TicketListPage scope="all" />)
      await screen.findByText('App crashes when uploading a file')

      await user.selectOptions(screen.getByLabelText('Filter by status'), 'open')
      await user.selectOptions(screen.getByLabelText('Filter by priority'), 'high')

      await waitFor(() => expect(lastQuery()).toMatchObject({ status: 'open', priority: 'high' }))
    })

    it('explains when no tickets match the filters', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TicketListPage scope="all" />)
      await screen.findByText('App crashes when uploading a file')

      mockGetTickets.mockResolvedValue(pageOf([]))
      await user.selectOptions(screen.getByLabelText('Filter by status'), 'resolved')

      expect(await screen.findByText('No tickets match your search and filters.')).toBeInTheDocument()
    })

    it('clears every filter', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TicketListPage scope="all" />)
      await screen.findByText('App crashes when uploading a file')

      await user.selectOptions(screen.getByLabelText('Filter by status'), 'open')
      await user.click(screen.getByRole('button', { name: 'Clear filters' }))

      expect(screen.getByLabelText('Filter by status')).toHaveValue('')
      await waitFor(() => expect(lastQuery()).toMatchObject({ status: '' }))
      expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()
    })

    it('starts with the search text from the URL', async () => {
      renderWithProviders(<TicketListPage scope="all" />, { route: '/tickets?search=invoice' })

      await waitFor(() => expect(lastQuery()).toMatchObject({ search: 'invoice' }))
      expect(screen.getByLabelText('Search tickets by title')).toHaveValue('invoice')
    })

    it('cancels the previous request when the filters change', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TicketListPage scope="all" />)
      await screen.findByText('App crashes when uploading a file')
      const firstSignal = mockGetTickets.mock.lastCall?.[1]

      await user.selectOptions(screen.getByLabelText('Filter by status'), 'open')

      await waitFor(() => expect(firstSignal?.aborted).toBe(true))
    })
  })

  describe('pagination', () => {
    it('requests the next page, and disables Next on the last page', async () => {
      const user = userEvent.setup()
      mockGetTickets.mockResolvedValue(pageOf([makeTicket()], { totalPages: 2, totalItems: 6 }))
      renderWithProviders(<TicketListPage scope="all" />)
      await screen.findByText('Page 1 of 2')

      await user.click(screen.getByRole('button', { name: 'Next' }))

      await waitFor(() => expect(lastQuery()).toMatchObject({ page: 2 }))
      expect(await screen.findByText('Page 2 of 2')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    })

    it('returns to page 1 when a filter changes', async () => {
      const user = userEvent.setup()
      mockGetTickets.mockResolvedValue(pageOf([makeTicket()], { totalPages: 2, totalItems: 6 }))
      renderWithProviders(<TicketListPage scope="all" />)
      await screen.findByText('Page 1 of 2')
      await user.click(screen.getByRole('button', { name: 'Next' }))
      await screen.findByText('Page 2 of 2')

      await user.selectOptions(screen.getByLabelText('Filter by priority'), 'low')

      await waitFor(() => expect(lastQuery()).toMatchObject({ page: 1, priority: 'low' }))
    })
  })
})
