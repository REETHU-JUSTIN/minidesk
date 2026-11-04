import { Bell, Menu, Search } from 'lucide-react'
import { getInitials } from '../../utils/getInitials'
import { previewCurrentUser } from '../../utils/previewData'
import { Button } from '../common/Button'

interface TopNavProps {
  title: string
  onOpenMenu: () => void
}

export function TopNav({ title, onOpenMenu }: TopNavProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
      <Button variant="ghost" className="!p-2 md:hidden" aria-label="Open menu" onClick={onOpenMenu}>
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <h1 className="truncate text-lg font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search tickets"
            placeholder="Search tickets..."
            className="w-56 rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-2 focus:outline-primary/20"
          />
        </div>

        <Button variant="ghost" className="!p-2" aria-label="Notifications">
          <Bell className="size-5" aria-hidden="true" />
        </Button>

        <button type="button" aria-label="Open profile menu" className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 md:pr-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {getInitials(previewCurrentUser.name)}
          </span>
          <span className="hidden text-sm font-medium md:block">{previewCurrentUser.name}</span>
        </button>
      </div>
    </header>
  )
}
