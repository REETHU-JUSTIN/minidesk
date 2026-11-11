import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as ticketService from '../../services/ticketService'
import { userLoggedOut } from '../../store/actions'
import type { CreateTicketInput, Ticket, TicketQuery, UpdateTicketInput } from '../../types'

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface TicketsState {
  // The ticket list page
  items: Ticket[]
  totalPages: number
  totalItems: number
  listStatus: RequestStatus
  listError: string | null
  // The ticket details page
  selectedTicket: Ticket | null
  detailStatus: RequestStatus
  detailError: string | null
}

const initialState: TicketsState = {
  items: [],
  totalPages: 1,
  totalItems: 0,
  listStatus: 'idle',
  listError: null,
  selectedTicket: null,
  detailStatus: 'idle',
  detailError: null,
}

// createAsyncThunk runs an async function and automatically dispatches three actions:
// "pending" when it starts, then "fulfilled" on success or "rejected" on failure.
// signal is provided by Redux Toolkit. Calling request.abort() in a component cancels
// the real HTTP request through it.
export const fetchTickets = createAsyncThunk('tickets/fetchList', (query: TicketQuery, { signal }) => ticketService.getTickets(query, signal))

export const fetchTicketById = createAsyncThunk('tickets/fetchOne', (ticketId: string, { signal }) => ticketService.getTicketById(ticketId, signal))

export const createTicket = createAsyncThunk('tickets/create', (input: CreateTicketInput) => ticketService.createTicket(input))

export const updateTicket = createAsyncThunk('tickets/update', ({ ticketId, changes }: { ticketId: string; changes: UpdateTicketInput }) =>
  ticketService.updateTicket(ticketId, changes),
)

export const deleteTicket = createAsyncThunk('tickets/delete', async (ticketId: string) => {
  await ticketService.deleteTicket(ticketId)
  return ticketId
})

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {},
  // extraReducers respond to actions created outside this slice, like the thunks above.
  // These lines look like they change state directly. Immer, built into Redux Toolkit,
  // turns them into a safe, immutable update.
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.items = action.payload.items
        state.totalPages = action.payload.totalPages
        state.totalItems = action.payload.totalItems
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        // An aborted request was cancelled on purpose, because a newer one replaced it.
        if (action.meta.aborted) return
        state.listStatus = 'failed'
        state.listError = action.error.message ?? 'We couldn\'t load the tickets.'
      })

      .addCase(fetchTicketById.pending, (state) => {
        state.detailStatus = 'loading'
        state.detailError = null
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.selectedTicket = action.payload
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.detailStatus = 'failed'
        state.detailError = action.error.message ?? 'We couldn\'t load that ticket.'
      })

      .addCase(updateTicket.fulfilled, (state, action) => {
        const updatedTicket = action.payload
        state.selectedTicket = updatedTicket
        state.items = state.items.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))
      })

      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.selectedTicket = null
        state.items = state.items.filter((ticket) => ticket.id !== action.payload)
      })

      .addCase(userLoggedOut, () => initialState)
  },
})

export default ticketsSlice.reducer
