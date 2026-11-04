import { LayoutDashboard, LogOut, Settings, Ticket, Tickets, Users } from 'lucide-react'
import { Logo } from '../common/Logo'

// Keeping the links in an array means adding a page takes one new line, not new JSX.
const navItems = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'my-tickets', label: 'My Tickets', icon: Ticket },
  { page: 'all-tickets', label: 'All Tickets', icon: Tickets },
  { page: 'users', label: 'Users', icon: Users },
  { page: 'settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  currentPage: string
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ currentPage, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Dark backdrop behind the slide-in menu on small screens */}
      {isOpen && <div className="fixed inset-0 z-30 bg-slate-900/50 md:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>

        <nav aria-label="Main" className="flex-1 space-y-1 px-3 py-2">
          {navItems.map(({ page, label, icon: Icon }) => {
            const isActive = page === currentPage
            return (
              <a
                key={page}
                href={`#${page}`}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-soft text-primary-hover' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="size-4.5" aria-hidden="true" />
                {label}
              </a>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <a
            href="#login"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="size-4.5" aria-hidden="true" />
            Logout
          </a>
        </div>
      </aside>
    </>
  )
}
