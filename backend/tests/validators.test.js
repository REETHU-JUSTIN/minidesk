import { describe, expect, it } from 'vitest'
import { AppError } from '../src/utils/AppError.js'
import { parseId, parseTicketQuery, validateComment, validateRegister, validateUpdateTicket } from '../src/utils/validators.js'

// These are plain functions, so they can be tested without a server or database.
describe('validateRegister', () => {
  it('keeps only known fields', () => {
    const result = validateRegister({ name: 'Test Person', email: 'test@example.com', password: 'long-enough', role: 'admin' })

    expect(result).toEqual({ ok: true, data: { name: 'Test Person', email: 'test@example.com', password: 'long-enough' } })
  })

  it('counts password length in bytes, because that is what bcrypt limits', () => {
    // 40 of these characters take 80 bytes.
    expect(validateRegister({ name: 'Test Person', email: 'test@example.com', password: 'é'.repeat(40) }).ok).toBe(false)
  })

  it('removes null characters', () => {
    const result = validateRegister({ name: 'Nul\0Name', email: 'test@example.com', password: 'long-enough' })

    expect(result).toMatchObject({ ok: true, data: { name: 'NulName' } })
  })
})

describe('validateUpdateTicket', () => {
  it('allows null for the agent, which means unassigned', () => {
    expect(validateUpdateTicket({ assignedAgentId: null })).toEqual({ ok: true, data: { assignedAgentId: null } })
  })

  it.each(['two', 1.5, -1, 99999999999, 'a'.repeat(23)])('rejects %s as an agent ID', (assignedAgentId) => {
    expect(validateUpdateTicket({ assignedAgentId }).ok).toBe(false)
  })

  it('requires at least one field', () => {
    expect(validateUpdateTicket({}).ok).toBe(false)
  })
})

describe('validateComment', () => {
  it('trims the message', () => {
    expect(validateComment({ message: '  Hello  ' })).toEqual({ ok: true, data: { message: 'Hello' } })
  })

  it('rejects a comment that is too long', () => {
    expect(validateComment({ message: 'x'.repeat(2001) }).ok).toBe(false)
  })
})

describe('parseId', () => {
  it('accepts a MongoDB ObjectId', () => {
    expect(parseId('65f1a2b3c4d5e6f708192a3b')).toBe('65f1a2b3c4d5e6f708192a3b')
  })

  it.each(['abc', '0', '1006', 'g'.repeat(24), 'a'.repeat(25)])('rejects %s', (value) => {
    expect(() => parseId(value)).toThrow(AppError)
  })
})

describe('parseTicketQuery', () => {
  it('fills in defaults', () => {
    expect(parseTicketQuery({})).toEqual({ scope: 'all', sort: 'newest', search: '', status: undefined, priority: undefined, page: 1, limit: 10 })
  })

  it('treats empty filters as no filter, which the frontend sends', () => {
    expect(parseTicketQuery({ status: '', priority: '' })).toMatchObject({ status: undefined, priority: undefined })
  })

  it('rejects a repeated filter', () => {
    expect(() => parseTicketQuery({ status: ['open', 'resolved'] })).toThrow(AppError)
  })
})
