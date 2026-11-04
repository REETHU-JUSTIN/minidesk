import { useRef, useState } from 'react'
import { LogOut, Settings } from 'lucide-react'
import { useCloseOnOutside } from '../../hooks/useCloseOnOutside'
import { getInitials } from '../../utils/getInitials'
import { previewCurrentUser } from '../../utils/previewData'
import { RoleBadge } from '../common/Badge'

const menuLinkClasses = 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100'

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { name, email, role } = previewCurrentUser

  useCloseOnOutside(containerRef, isOpen, () => setIsOpen(false))

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Profile menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 md:pr-2"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
          {getInitials(name)}
        </span>
        <span className="hidden text-sm font-medium md:block">{name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-30 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="mb-2 truncate text-xs text-slate-500">{email}</p>
            <RoleBadge role={role} />
          </div>
          <div className="p-2">
            <a href="#settings" onClick={() => setIsOpen(false)} className={menuLinkClasses}>
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </a>
            <a href="#login" onClick={() => setIsOpen(false)} className={menuLinkClasses}>
              <LogOut className="size-4" aria-hidden="true" />
              Logout
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
