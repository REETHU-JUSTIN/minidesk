import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import ticketsReducer from '../features/tickets/ticketsSlice'

// The store holds all Redux state. Each key here is one slice of it,
// so ticket data is at state.tickets and dashboard data is at state.dashboard.
export const store = configureStore({
  reducer: {
    tickets: ticketsReducer,
    dashboard: dashboardReducer,
  },
})

// TypeScript works these types out from the store, so they stay correct as slices are added.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
