import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { Ticket } from '../src/models/Ticket'
import { api, closeDatabase, resetData, tokenFor } from './helpers'

beforeAll(resetData)
afterEach(() => vi.restoreAllMocks())
afterAll(closeDatabase)

describe('error handling', () => {
  it('answers an unknown address with a JSON 404', async () => {
    const response = await api.get('/api/nope')

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('That address doesn\'t exist.')
  })

  it('answers broken JSON with a 400 that reveals nothing', async () => {
    const response = await api.post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json')

    expect(response.status).toBe(400)
    expect(response.text).not.toMatch(/SyntaxError|node_modules/)
  })

  it.each(['[1,2]', 'null'])('rejects a JSON body of %s', async (body) => {
    const response = await api.post('/api/auth/login').set('Content-Type', 'application/json').send(body)

    expect(response.status).toBe(400)
  })

  it('rejects a body that is too large', async () => {
    const response = await api.post('/api/auth/login').send({ email: 'x'.repeat(200_000) })

    expect(response.status).toBe(413)
  })

  it('hides the details of an unexpected error, and logs them on the server', async () => {
    const token = await tokenFor('admin@example.com')
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(Ticket, 'countDocuments').mockImplementation(() => {
      throw new Error('secret database detail')
    })

    const response = await api.get('/api/tickets').set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(500)
    expect(response.body.error.message).toBe('Something went wrong. Please try again.')
    expect(response.text).not.toContain('secret database detail')
    expect(logged).toHaveBeenCalled()
  })

  it('does not advertise the framework', async () => {
    const response = await api.get('/api/health')

    expect(response.headers['x-powered-by']).toBeUndefined()
  })
})
