import { useCallback, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { LinkButton } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Pagination } from '../components/common/Pagination'
import { TicketFilters } from '../components/tickets/TicketFilters'
import { TicketTable } from '../components/tickets/TicketTable'
import { useDebounce } from '../hooks/useDebounce'
import type { TicketFilterValues } from '../types'
import { filterTickets, paginate, previewTickets } from '../utils/previewData'

const PAGE_SIZE = 5
const noFilters: TicketFilterValues = { search: '', status: '', priority: '' }

export function TicketListPage() {
  const [filters, setFilters] = useState(noFilters)
  const [page, setPage] = useState(1)

  const { search, status, priority } = filters
  const debouncedSearch = useDebounce(search, 300)

  // useCallback keeps these functions the same between renders, so memo in TicketFilters can work.
  // Their dependency lists are empty because state setters never change.
  const handleFilterChange = useCallback((changes: Partial<TicketFilterValues>) => {
    // The function form reads the latest state, and spread keeps the fields not being changed.
    setFilters((currentFilters) => ({ ...currentFilters, ...changes }))
    setPage(1) // the old page might not exist in the new results
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters(noFilters)
    setPage(1)
  }, [])

  // Typing re-renders this page on every keystroke, but the search only applies after the
  // debounce. useMemo skips filtering again until one of the values it uses has changed.
  const matchingTickets = useMemo(
    () => filterTickets(previewTickets, { search: debouncedSearch, status, priority }),
    [debouncedSearch, status, priority],
  )

  const { items: ticketsOnPage, totalPages, totalItems } = paginate(matchingTickets, page, PAGE_SIZE)

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <TicketFilters filters={filters} onFilterChange={handleFilterChange} onClear={handleClearFilters} />
        <LinkButton href="#create-ticket" className="whitespace-nowrap">
          <Plus className="size-4" aria-hidden="true" />
          Create Ticket
        </LinkButton>
      </div>

      <Card>
        <TicketTable tickets={ticketsOnPage} />
        {totalItems > 0 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      </Card>
    </>
  )
}
