import { useState } from 'react'
import type { FormEvent } from 'react'
import { Menu, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useAuth'
import { Button } from '../common/Button'
import { NotificationMenu } from './NotificationMenu'
import { ProfileMenu } from './ProfileMenu'

interface TopNavProps {
  title: string
  onOpenMenu: () => void
}

export function TopNav({ title, onOpenMenu }: TopNavProps) {
  const [searchText, setSearchText] = useState('')
  const { role } = useCurrentUser()
  const navigate = useNavigate()

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = searchText.trim()
    if (term === '') return

    // Customers have no All Tickets page. encodeURIComponent makes the text safe for a URL.
    const listPath = role === 'customer' ? '/tickets/mine' : '/tickets'
    navigate(`${listPath}?search=${encodeURIComponent(term)}`)
    setSearchText('')
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
      <Button variant="ghost" className="!p-2 md:hidden" aria-label="Open menu" onClick={onOpenMenu}>
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <h1 className="truncate text-lg font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <form role="search" className="relative hidden sm:block" onSubmit={handleSearch}>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search tickets"
            placeholder="Search tickets..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="w-56 rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-2 focus:outline-primary/20"
          />
        </form>

        <NotificationMenu />
        <ProfileMenu />
      </div>
    </header>
  )
}
