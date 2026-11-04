import { memo } from 'react'
import { Search } from 'lucide-react'
import type { TicketFilterValues, TicketPriority, TicketStatus } from '../../types'
import { priorityLabels, statusLabels, ticketPriorities, ticketStatuses } from '../../utils/ticketLabels'
import { Button } from '../common/Button'
import { Select } from '../common/Select'

interface TicketFiltersProps {
  filters: TicketFilterValues
  onFilterChange: (changes: Partial<TicketFilterValues>) => void
  onClear: () => void
}

// memo skips re-rendering when the props haven't changed, such as when only the page number
// changes. This works only if the parent's functions stay the same between renders,
// which is why the parent wraps them in useCallback.
export const TicketFilters = memo(function TicketFilters({ filters, onFilterChange, onClear }: TicketFiltersProps) {
  const { search, status, priority } = filters
  const hasActiveFilters = search !== '' || status !== '' || priority !== ''

  return (
    <>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        {/* A controlled input: React state holds the value, and each keystroke updates that state */}
        <input
          type="search"
          aria-label="Search tickets by title"
          placeholder="Search by title..."
          value={search}
          onChange={(event) => onFilterChange({ search: event.target.value })}
          className="block w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-2 focus:outline-primary/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:flex">
        <Select
          aria-label="Filter by status"
          value={status}
          // The browser gives us a plain string, so "as" tells TypeScript which values are possible.
          onChange={(event) => onFilterChange({ status: event.target.value as TicketStatus | '' })}
        >
          <option value="">All statuses</option>
          {ticketStatuses.map((option) => (
            <option key={option} value={option}>
              {statusLabels[option]}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by priority"
          value={priority}
          onChange={(event) => onFilterChange({ priority: event.target.value as TicketPriority | '' })}
        >
          <option value="">All priorities</option>
          {ticketPriorities.map((option) => (
            <option key={option} value={option}>
              {priorityLabels[option]}
            </option>
          ))}
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" className="whitespace-nowrap" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </>
  )
})
