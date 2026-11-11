import jwt from 'jsonwebtoken'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { env } from '../src/config/env'
import { api, closeDatabase, resetData, tokenFor, user } from './helpers'

beforeAll(resetData)
afterAll(closeDatabase)

const ADMIN_ID = user(1)
const getMe = (token: string) => api.get('/api/auth/me').set('Authorization', `Bearer ${token}`)

describe('authenticate middleware', () => {
  it('accepts a valid token, and sets the user', async () => {
    const response = await getMe(await tokenFor('admin@example.com'))

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({ email: 'admin@example.com', role: 'admin' })
  })

  it('rejects a request with no token', async () => {
    const response = await api.get('/api/auth/me')

    expect(response.status).toBe(401)
    expect(response.body.error.message).toBe('Please sign in to continue.')
  })

  it('rejects the wrong kind of Authorization header', async () => {
    const token = await tokenFor('admin@example.com')

    const response = await api.get('/api/auth/me').set('Authorization', `Basic ${token}`)

    expect(response.status).toBe(401)
  })

  it('rejects a token that is not a real token', async () => {
    expect((await getMe('garbage')).status).toBe(401)
  })

  it('accepts a correctly signed token, which proves the tests below fail for the right reason', async () => {
    const token = jwt.sign({}, env.jwtSecret, { subject: ADMIN_ID, expiresIn: '1m' })

    expect((await getMe(token)).status).toBe(200)
  })

  it('rejects an expired token', async () => {
    const token = jwt.sign({}, env.jwtSecret, { subject: ADMIN_ID, expiresIn: -60 })

    expect((await getMe(token)).status).toBe(401)
  })

  it('rejects a token signed with the wrong secret', async () => {
    const token = jwt.sign({}, 'a-completely-different-secret-value', { subject: ADMIN_ID, expiresIn: '1m' })

    expect((await getMe(token)).status).toBe(401)
  })

  it('rejects an unsigned token using the "none" algorithm', async () => {
    const token = jwt.sign({}, '', { subject: ADMIN_ID, algorithm: 'none' })

    expect((await getMe(token)).status).toBe(401)
  })

  it('rejects a token whose contents were changed', async () => {
    const [header, , signature] = (await tokenFor('priya@example.com')).split('.')
    const changedPayload = Buffer.from(JSON.stringify({ sub: ADMIN_ID })).toString('base64url')

    expect((await getMe(`${header}.${changedPayload}.${signature}`)).status).toBe(401)
  })

  it('rejects a valid token for a user who no longer exists', async () => {
    const token = jwt.sign({}, env.jwtSecret, { subject: 'ffffffffffffffffffffffff', expiresIn: '1m' })

    expect((await getMe(token)).status).toBe(401)
  })

  it('rejects a valid token with an invalid user ID', async () => {
    const token = jwt.sign({}, env.jwtSecret, { subject: 'abc', expiresIn: '1m' })

    expect((await getMe(token)).status).toBe(401)
  })

  it('puts nothing sensitive in the token', async () => {
    const decoded = jwt.decode(await tokenFor('admin@example.com')) as Record<string, unknown>

    expect(Object.keys(decoded).sort()).toEqual(['exp', 'iat', 'sub'])
  })

  it.each([
    ['get', '/api/tickets'],
    ['post', '/api/tickets'],
    ['get', '/api/tickets/1006'],
    ['put', '/api/tickets/1006'],
    ['delete', '/api/tickets/1006'],
    ['get', '/api/tickets/1006/comments'],
    ['post', '/api/tickets/1006/comments'],
    ['get', '/api/dashboard/stats'],
    ['get', '/api/users'],
  ] as const)('protects %s %s', async (method, path) => {
    expect((await api[method](path)).status).toBe(401)
  })
})
