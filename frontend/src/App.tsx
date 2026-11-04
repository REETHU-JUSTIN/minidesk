import { useEffect, useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { CreateTicketPage } from './pages/CreateTicketPage'
import { DashboardPage } from './pages/DashboardPage'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import { SettingsPage } from './pages/SettingsPage'
import { TicketDetailsPage } from './pages/TicketDetailsPage'
import { TicketListPage } from './pages/TicketListPage'
import { UsersPage } from './pages/UsersPage'

// TEMPORARY navigation for Phase 1: the part of the URL after # picks the page.
// Phase 4 replaces this whole approach with React Router.
const signedInPages = {
  dashboard: { title: 'Dashboard', content: <DashboardPage /> },
  'my-tickets': { title: 'My Tickets', content: <TicketListPage /> },
  'all-tickets': { title: 'All Tickets', content: <TicketListPage /> },
  'create-ticket': { title: 'Create Ticket', content: <CreateTicketPage /> },
  'ticket-details': { title: 'Ticket Details', content: <TicketDetailsPage /> },
  users: { title: 'Users', content: <UsersPage /> },
  settings: { title: 'Settings', content: <SettingsPage /> },
  'design-system': { title: 'Design System', content: <DesignSystemPage /> },
}

const signedOutPages = {
  login: <LoginPage />,
  register: <RegisterPage />,
  'forgot-password': <ForgotPasswordPage />,
  'not-found': <NotFoundPage />,
}

const allPageNames = [...Object.keys(signedInPages), ...Object.keys(signedOutPages)]

function getPageFromUrl() {
  return window.location.hash.slice(1) || 'dashboard'
}

function renderPage(pageName: string) {
  if (pageName in signedInPages) {
    const { title, content } = signedInPages[pageName as keyof typeof signedInPages]
    return (
      <AppLayout title={title} currentPage={pageName}>
        {content}
      </AppLayout>
    )
  }
  if (pageName in signedOutPages) {
    return signedOutPages[pageName as keyof typeof signedOutPages]
  }
  return <NotFoundPage />
}

export default function App() {
  const [pageName, setPageName] = useState(getPageFromUrl)

  // useEffect subscribes to the browser's hashchange event, and the cleanup unsubscribes.
  useEffect(() => {
    function handleHashChange() {
      setPageName(getPageFromUrl())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <>
      {/* The bottom padding keeps the fixed preview helper from covering page content */}
      <div className="pb-14">{renderPage(pageName)}</div>

      {/* TEMPORARY helper so you can reach every page, including signed-out ones */}
      <select
        aria-label="Preview page"
        value={pageName}
        onChange={(event) => {
          window.location.hash = event.target.value
        }}
        className="fixed right-4 bottom-4 z-40 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs shadow-md"
      >
        {allPageNames.map((name) => (
          <option key={name} value={name}>
            Preview: {name}
          </option>
        ))}
      </select>
    </>
  )
}
