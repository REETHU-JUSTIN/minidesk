import { describe, expect, it } from 'vitest'
import { userLoggedOut } from '../../store/actions'
import { makeTicket } from '../../test/testUtils'
import reducer, { deleteTicket, fetchTickets, updateTicket } from './ticketsSlice'

// A reducer is a pure function, so it can be tested with no store, server or component.
const initialState = reducer(undefined, { type: 'unknown' })
const query = { page: 1 }

describe('ticketsSlice', () => {
  it('marks the list as loading and clears any old error', () => {
    const failed = { ...initialState, listStatus: 'failed', listError: 'Old error' }

    const state = reducer(failed, fetchTickets.pending('request-1', query))

    expect(state.listStatus).toBe('loading')
    expect(state.listError).toBeNull()
  })

  it('stores the tickets when loading succeeds', () => {
    const payload = { items: [makeTicket()], page: 1, totalPages: 3, totalItems: 11 }

    const state = reducer(initialState, fetchTickets.fulfilled(payload, 'request-1', query))

    expect(state.listStatus).toBe('succeeded')
    expect(state.items).toEqual(payload.items)
    expect(state.totalPages).toBe(3)
    expect(state.totalItems).toBe(11)
  })

  it('stores the message when loading fails', () => {
    const state = reducer(initialState, fetchTickets.rejected(new Error('Server error'), 'request-1', query))

    expect(state.listStatus).toBe('failed')
    expect(state.listError).toBe('Server error')
  })

  it('ignores a request that was cancelled on purpose', () => {
    const loading = reducer(initialState, fetchTickets.pending('request-2', query))
    const rejected = fetchTickets.rejected(new Error('Aborted'), 'request-1', query)
    const aborted = { ...rejected, meta: { ...rejected.meta, aborted: true } }

    const state = reducer(loading, aborted)

    expect(state.listStatus).toBe('loading')
    expect(state.listError).toBeNull()
  })

  it('updates a ticket in both the list and the details page', () => {
    const other = makeTicket({ id: 'a' })
    const original = makeTicket({ id: 'b', status: 'open' })
    const updated = { ...original, status: 'resolved' }
    const before = { ...initialState, items: [other, original], selectedTicket: original }

    const state = reducer(before, updateTicket.fulfilled(updated, 'request-1', { ticketId: 'b', changes: { status: 'resolved' } }))

    expect(state.selectedTicket?.status).toBe('resolved')
    expect(state.items).toEqual([other, updated])
  })

  it('removes a deleted ticket', () => {
    const before = { ...initialState, items: [makeTicket({ id: 'a' }), makeTicket({ id: 'b' })], selectedTicket: makeTicket({ id: 'b' }) }

    const state = reducer(before, deleteTicket.fulfilled('b', 'request-1', 'b'))

    expect(state.items.map((ticket) => ticket.id)).toEqual(['a'])
    expect(state.selectedTicket).toBeNull()
  })

  it('clears everything on logout, so the next user sees none of it', () => {
    const before = { ...initialState, items: [makeTicket()], selectedTicket: makeTicket(), listStatus: 'succeeded' }

    expect(reducer(before, userLoggedOut())).toEqual(initialState)
  })
})
