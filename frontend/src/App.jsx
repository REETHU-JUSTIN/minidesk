import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { GuestRoute } from './components/layout/GuestRoute'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { CreateTicketPage } from './pages/CreateTicketPage'
import { DashboardPage } from './pages/DashboardPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import { SettingsPage } from './pages/SettingsPage'
import { TicketDetailsPage } from './pages/TicketDetailsPage'
import { TicketListPage } from './pages/TicketListPage'
import { UsersPage } from './pages/UsersPage'

// Routes without a path are "layout routes". They wrap the routes nested inside them:
// ProtectedRoute checks access, then AppLayout adds the sidebar and top bar around the page.
export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets/mine" element={<TicketListPage scope="mine" />} />
          <Route path="/tickets/:ticketId" element={<TicketDetailsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route element={<ProtectedRoute allowedRoles={['admin', 'agent']} />}>
            <Route path="/tickets" element={<TicketListPage scope="all" />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/tickets/new" element={<CreateTicketPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
