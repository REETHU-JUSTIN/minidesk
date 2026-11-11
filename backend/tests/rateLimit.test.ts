import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { api, closeDatabase, DEMO_PASSWORD, resetData } from './helpers'

// The limit is read when the app first loads. vi.hoisted runs before the imports above,
// so the app sees this low limit. Each test file loads its own copy of the app,
// so this affects only this file.
vi.hoisted(() => {
  process.env.LOGIN_ATTEMPT_LIMIT = '3'
})

beforeAll(resetData)
afterAll(closeDatabase)

const login = (password: string) => api.post('/api/auth/login').send({ email: 'admin@example.com', password })

describe('login rate limiting', () => {
  it('does not count successful logins', async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      expect((await login(DEMO_PASSWORD)).status).toBe(200)
    }
  })

  it('blocks an address after too many failed attempts', async () => {
    const statuses = []
    for (let attempt = 0; attempt < 4; attempt++) {
      statuses.push((await login('wrong-guess')).status)
    }

    expect(statuses).toEqual([401, 401, 401, 429])
  })

  it('explains the block and says when to try again', async () => {
    const response = await login(DEMO_PASSWORD)

    expect(response.status).toBe(429)
    expect(response.body.error.message).toBe('Too many attempts. Please wait a few minutes and try again.')
    expect(response.headers['ratelimit-policy']).toBeDefined()
  })
})
