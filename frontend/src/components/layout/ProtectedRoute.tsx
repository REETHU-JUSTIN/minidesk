import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types'
import { Spinner } from '../common/Spinner'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

// This only controls what the screen shows. It is not security, because anyone can
// change code in their own browser. The real protection is on the server, in Phase 5.
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isRestoringSession } = useAuth()
  const location = useLocation()

  // Wait for the session check, or a signed-in user would be sent to login on every refresh.
  if (isRestoringSession) {
    return <Spinner />
  }

  if (!user) {
    // Remember where they were going, so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  // Outlet renders whichever nested route matched the URL.
  return <Outlet />
}
