import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { api, closeDatabase, DEMO_PASSWORD, resetData } from './helpers'

beforeEach(resetData)
afterAll(closeDatabase)

describe('POST /api/auth/register', () => {
  const newUser = { name: 'Test Person', email: 'test@example.com', password: 'long-enough-password' }

  it('creates a customer and returns a token', async () => {
    const response = await api.post('/api/auth/register').send(newUser)

    expect(response.status).toBe(201)
    expect(response.body.data.token).toEqual(expect.any(String))
    expect(response.body.data.user).toMatchObject({ name: 'Test Person', email: 'test@example.com', role: 'customer' })
  })

  it('cannot be used to create an admin', async () => {
    const response = await api.post('/api/auth/register').send({ ...newUser, role: 'admin' })

    expect(response.body.data.user.role).toBe('customer')
  })

  it('stores emails in lowercase', async () => {
    const response = await api.post('/api/auth/register').send({ ...newUser, email: '  TEST@Example.com ' })

    expect(response.body.data.user.email).toBe('test@example.com')
  })

  it('rejects an email that is already registered', async () => {
    const response = await api.post('/api/auth/register').send({ ...newUser, email: 'admin@example.com' })

    expect(response.status).toBe(409)
    expect(response.body.error.message).toBe('An account with this email already exists.')
  })

  it('allows only one account when the same email signs up at the same moment', async () => {
    const responses = await Promise.all(Array.from({ length: 5 }, () => api.post('/api/auth/register').send(newUser)))

    expect(responses.map((response) => response.status).sort()).toEqual([201, 409, 409, 409, 409])
  })

  it('reports each invalid field', async () => {
    const response = await api.post('/api/auth/register').send({ name: 'x', email: 'bad', password: 'short' })

    expect(response.status).toBe(400)
    expect(Object.keys(response.body.error.details).sort()).toEqual(['email', 'name', 'password'])
  })

  it('rejects passwords longer than bcrypt can use', async () => {
    const response = await api.post('/api/auth/register').send({ ...newUser, password: 'x'.repeat(73) })

    expect(response.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('returns a token and the user for correct details', async () => {
    const response = await api.post('/api/auth/login').send({ email: 'admin@example.com', password: DEMO_PASSWORD })

    expect(response.status).toBe(200)
    expect(response.body.data.token).toEqual(expect.any(String))
    expect(response.body.data.user).toMatchObject({ email: 'admin@example.com', role: 'admin' })
  })

  it('never returns the password hash', async () => {
    const response = await api.post('/api/auth/login').send({ email: 'admin@example.com', password: DEMO_PASSWORD })

    expect(response.text).not.toMatch(/passwordHash|password_hash|\$2[aby]\$/)
  })

  it('accepts a new account right after it signs up', async () => {
    await api.post('/api/auth/register').send({ name: 'Test Person', email: 'test@example.com', password: 'long-enough-password' })

    const response = await api.post('/api/auth/login').send({ email: 'test@example.com', password: 'long-enough-password' })

    expect(response.status).toBe(200)
  })

  it('gives the same answer for a wrong password and an unknown email', async () => {
    const wrongPassword = await api.post('/api/auth/login').send({ email: 'admin@example.com', password: 'wrong' })
    const unknownEmail = await api.post('/api/auth/login').send({ email: 'nobody@example.com', password: 'wrong' })

    expect(wrongPassword.status).toBe(401)
    expect(unknownEmail.status).toBe(401)
    expect(wrongPassword.body).toEqual(unknownEmail.body)
  })

  it('rejects objects sent in place of strings', async () => {
    const response = await api.post('/api/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } })

    expect(response.status).toBe(400)
  })

  it('treats SQL in the email as plain text', async () => {
    const response = await api.post('/api/auth/login').send({ email: "admin@example.com' --", password: 'x' })

    expect(response.status).not.toBe(200)
  })
})
