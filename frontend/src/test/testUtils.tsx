import type { ReactNode } from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthContext } from '../context/AuthContext'
import type { AuthContextValue } from '../context/AuthContext'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import ticketsReducer from '../features/tickets/ticketsSlice'
import type { Ticket, User } from '../types'

export const adminUser: User = { id: 1, name: 'Alex Morgan', email: 'admin@example.com', role: 'admin', createdAt: '2026-09-01T12:00:00.000Z' }
export const agentUser: User = { id: 2, name: 'Sam Carter', email: 'sam@example.com', role: 'agent', createdAt: '2026-09-03T12:00:00.000Z' }
export const customerUser: User = { id: 4, name: 'Priya Nair', email: 'priya@example.com', role: 'customer', createdAt: '2026-10-02T12:00:00.000Z' }

// Builds a ticket, so each test only has to state the fields it cares about.
export function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 1006,
    title: 'App crashes when uploading a file',
    description: 'The app closes without an error message.',
    category: 'technical',
    priority: 'high',
    status: 'in_progress',
    customerId: 4,
    customerName: 'Priya Nair',
    customerEmail: 'priya@example.com',
    assignedAgentId: 3,
    assignedAgentName: 'Maya Lee',
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '2026-11-01T15:40:00.000Z',
    ...overrides,
  }
}

export function makeAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user: adminUser,
    isRestoringSession: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  }
}

interface RenderOptions {
  auth?: Partial<AuthContextValue>
  route?: string
}

// Renders a component with everything the real app provides around it.
// Each call gets a fresh store, so no data leaks between tests.
export function renderWithProviders(ui: ReactNode, { auth, route = '/' }: RenderOptions = {}) {
  const store = configureStore({ reducer: { tickets: ticketsReducer, dashboard: dashboardReducer } })

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <AuthContext.Provider value={makeAuthValue(auth)}>{ui}</AuthContext.Provider>
      </MemoryRouter>
    </Provider>,
  )
}
