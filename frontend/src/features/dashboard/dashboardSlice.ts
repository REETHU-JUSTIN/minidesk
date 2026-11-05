import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getDashboardStats, getTickets } from '../../services/ticketService'
import { userLoggedOut } from '../../store/actions'
import type { DashboardStats, Ticket } from '../../types'

interface DashboardState {
  stats: DashboardStats | null
  recentTickets: Ticket[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: DashboardState = {
  stats: null,
  recentTickets: [],
  status: 'idle',
  error: null,
}

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (_: void, { signal }) => {
  // Promise.all starts both requests together and waits for both to finish.
  // If either one fails, the whole thunk is rejected.
  const [stats, recentTickets] = await Promise.all([getDashboardStats(signal), getTickets({ limit: 5 }, signal)])
  return { stats, recentTickets: recentTickets.items }
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.stats = action.payload.stats
        state.recentTickets = action.payload.recentTickets
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.status = 'failed'
        state.error = action.error.message ?? 'We couldn\'t load the dashboard.'
      })
      .addCase(userLoggedOut, () => initialState)
  },
})

export default dashboardSlice.reducer
