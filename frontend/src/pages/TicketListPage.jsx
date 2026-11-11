import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LinkButton } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { Pagination } from '../components/common/Pagination'
import { Spinner } from '../components/common/Spinner'
import { TicketFilters } from '../components/tickets/TicketFilters'
import { TicketTable } from '../components/tickets/TicketTable'
import { fetchTickets } from '../features/tickets/ticketsSlice'
import { useCurrentUser } from '../hooks/useAuth'
import { useDebounce } from '../hooks/useDebounce'
import { useAppDispatch, useAppSelector } from '../store/hooks'

const PAGE_SIZE = 5
const noFilters = { search: '', status: '', priority: '' }

// The top bar search links here with ?search=text in the URL. Using that text in the key
// creates a fresh TicketList with its filters reset, including when you search from this page.
export function TicketListPage({ scope }) {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''

  return <TicketList key={`${scope}:${initialSearch}`} scope={scope} initialSearch={initialSearch} />
}

function TicketList({ scope, initialSearch }) {
  const [filters, setFilters] = useState({ ...noFilters, search: initialSearch })
  const [page, setPage] = useState(1)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { role } = useCurrentUser()
  const { items, totalPages, totalItems, listStatus, listError } = useAppSelector((state) => state.tickets)

  const { search, status, priority } = filters
  const debouncedSearch = useDebounce(search, 300)

  // Fetch whenever a filter or the page changes. If they change again before the response
  // arrives, the cleanup cancels the old request so an old response can't overwrite a newer one.
  useEffect(() => {
    const request = dispatch(fetchTickets({ scope, search: debouncedSearch, status, priority, page, limit: PAGE_SIZE }))
    return () => request.abort()
  }, [dispatch, scope, debouncedSearch, status, priority, page])

  // useCallback keeps these functions the same between renders, so memo in TicketFilters can work.
  const handleFilterChange = useCallback((changes) => {
    // The function form reads the latest state, and spread keeps the fields not being changed.
    setFilters((currentFilters) => ({ ...currentFilters, ...changes }))
    setPage(1) // the old page might not exist in the new results
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters(noFilters)
    setPage(1)
    // Remove ?search= from the URL too, so a refresh doesn't bring the search back.
    navigate({ search: '' }, { replace: true })
  }, [navigate])

  const hasActiveFilters = debouncedSearch !== '' || status !== '' || priority !== ''
  const isFirstLoad = listStatus === 'idle' || (listStatus === 'loading' && items.length === 0)

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <TicketFilters filters={filters} onFilterChange={handleFilterChange} onClear={handleClearFilters} />
        {role === 'customer' && (
          <LinkButton to="/tickets/new" className="whitespace-nowrap">
            <Plus className="size-4" aria-hidden="true" />
            Create Ticket
          </LinkButton>
        )}
      </div>

      {listStatus === 'failed' && <ErrorMessage message={listError ?? 'We couldn\'t load the tickets.'} />}

      {listStatus !== 'failed' && (
        <Card>
          {isFirstLoad && <Spinner label="Loading tickets..." />}

          {listStatus === 'succeeded' && items.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-slate-500">
              {hasActiveFilters ? 'No tickets match your search and filters.' : 'No tickets here yet.'}
            </p>
          )}

          {items.length > 0 && (
            // Fading the old rows during a reload is less jarring than replacing them with a spinner.
            <div className={listStatus === 'loading' ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              <TicketTable tickets={items} />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}

          <p className="sr-only" role="status">
            {listStatus === 'succeeded' ? `${totalItems} tickets found` : ''}
          </p>
        </Card>
      )}
    </>
  )
}
