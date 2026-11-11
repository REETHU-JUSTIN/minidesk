import { LayoutDashboard, LogOut, Settings, Ticket, Tickets, Users } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth, useCurrentUser } from '../../hooks/useAuth'
import { Logo } from '../common/Logo'

const allRoles = ['admin', 'agent', 'customer']

// Keeping the links in an array means adding a page takes one new line, not new JSX.
const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: allRoles },
  { to: '/tickets/mine', label: 'My Tickets', icon: Ticket, roles: allRoles },
  { to: '/tickets', label: 'All Tickets', icon: Tickets, roles: ['admin', 'agent'] },
  { to: '/users', label: 'Users', icon: Users, roles: ['admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: allRoles },
]

export function Sidebar({ isOpen, onClose }) {
  const { role } = useCurrentUser()
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

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
          {navItems
            .filter((item) => item.roles.includes(role))
            .map(({ to, label, icon: Icon }) => (
              // NavLink knows whether it matches the URL. "end" stops /tickets from
              // also being highlighted on /tickets/mine.
              <NavLink
                key={to}
                to={to}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-soft text-primary-hover' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="size-4.5" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="size-4.5" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
