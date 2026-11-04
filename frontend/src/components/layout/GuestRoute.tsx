import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../common/Spinner'

// For login and sign-up pages. Someone already signed in doesn't need them.
export function GuestRoute() {
  const { user, isRestoringSession } = useAuth()
  const location = useLocation()

  if (isRestoringSession) {
    return <Spinner />
  }

  if (user) {
    // After login, go to the page the user originally asked for, if there was one.
    const { from } = (location.state as { from?: string } | null) ?? {}
    return <Navigate to={from ?? '/dashboard'} replace />
  }

  return <Outlet />
}
