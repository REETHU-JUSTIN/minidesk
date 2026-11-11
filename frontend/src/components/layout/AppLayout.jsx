import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

function getPageTitle(pathname) {
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname === '/tickets') return 'All Tickets'
  if (pathname === '/tickets/mine') return 'My Tickets'
  if (pathname === '/tickets/new') return 'Create Ticket'
  if (pathname.startsWith('/tickets/')) return 'Ticket Details'
  if (pathname === '/users') return 'Users'
  if (pathname === '/settings') return 'Settings'
  return 'MiniDesk'
}

// The shell around every signed-in page. Outlet is whichever page matched the URL.
export function AppLayout() {
  // Only the layout cares whether the mobile menu is open, so local state is enough.
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {/* min-w-0 lets wide tables scroll inside their card instead of stretching the page */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav title={getPageTitle(pathname)} onOpenMenu={() => setIsMenuOpen(true)} />
        <main className="flex-1 space-y-6 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
