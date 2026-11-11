import { screen } from '@testing-library/react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { adminUser, customerUser, renderWithProviders } from '../../test/testUtils'
import { GuestRoute } from './GuestRoute'
import { ProtectedRoute } from './ProtectedRoute'

// Shows where a redirect ended up, including the remembered page.
function LoginStandIn() {
  const location = useLocation()
  return <p>Login page, from: {String((location.state)?.from)}</p>
}

function renderRoutes(user, route, isRestoringSession = false) {
  renderWithProviders(
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<p>Dashboard page</p>} />
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/users" element={<p>Users page</p>} />
        </Route>
      </Route>
      <Route path="/login" element={<LoginStandIn />} />
    </Routes>,
    { route, auth: { user, isRestoringSession } },
  )
}

describe('ProtectedRoute', () => {
  it('waits while the session is being restored, instead of redirecting', () => {
    renderRoutes(null, '/dashboard', true)

    expect(screen.getByRole('status')).toHaveTextContent('Loading')
    expect(screen.queryByText(/Login page/)).not.toBeInTheDocument()
  })

  it('sends signed-out visitors to login, remembering where they were going', () => {
    renderRoutes(null, '/users?tab=all')

    expect(screen.getByText('Login page, from: /users?tab=all')).toBeInTheDocument()
  })

  it('shows the page to a signed-in user', () => {
    renderRoutes(customerUser, '/dashboard')

    expect(screen.getByText('Dashboard page')).toBeInTheDocument()
  })

  it('shows a role-limited page to the right role', () => {
    renderRoutes(adminUser, '/users')

    expect(screen.getByText('Users page')).toBeInTheDocument()
  })

  it('redirects the wrong role to the dashboard', () => {
    renderRoutes(customerUser, '/users')

    expect(screen.getByText('Dashboard page')).toBeInTheDocument()
    expect(screen.queryByText('Users page')).not.toBeInTheDocument()
  })
})

describe('GuestRoute', () => {
  function renderGuestRoutes(user) {
    renderWithProviders(
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<p>Login form</p>} />
        </Route>
        <Route path="/dashboard" element={<p>Dashboard page</p>} />
      </Routes>,
      { route: '/login', auth: { user } },
    )
  }

  it('shows the login form to signed-out visitors', () => {
    renderGuestRoutes(null)

    expect(screen.getByText('Login form')).toBeInTheDocument()
  })

  it('sends signed-in users away from the login form', () => {
    renderGuestRoutes(adminUser)

    expect(screen.getByText('Dashboard page')).toBeInTheDocument()
  })
})
