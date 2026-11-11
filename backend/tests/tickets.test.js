import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { api, closeDatabase, resetData, ticket, tokenFor, user } from './helpers.js'

let admin
let agent // Sam
let priya // a customer who owns tickets 1008, 1006 and 1002
let liam // another customer

beforeAll(async () => {
  await resetData()
  ;[admin, agent, priya, liam] = await Promise.all(
    ['admin@example.com', 'sam@example.com', 'priya@example.com', 'liam@example.com'].map(tokenFor),
  )
})
beforeEach(resetData)
afterAll(closeDatabase)

const asUser = (token) => ({ Authorization: `Bearer ${token}` })
const list = (token, query = '') => api.get(`/api/tickets${query}`).set(asUser(token))
// The sample IDs end in the ticket number, which keeps these tests easy to read.
const ids = (response) => response.body.data.items.map((item) => Number(item.id.slice(-4)))
const update = (token, number, changes) => api.put(`/api/tickets/${ticket(number)}`).set(asUser(token)).send(changes)

const newTicket = { title: 'Printer is on fire', description: 'Smoke is coming out of it.', category: 'technical', priority: 'high' }

describe('GET /api/tickets', () => {
  it('lists tickets newest first, with people\'s names', async () => {
    const response = await list(admin, '?limit=2')

    expect(response.status).toBe(200)
    expect(ids(response)).toEqual([1008, 1007])
    expect(response.body.data.items[0]).toMatchObject({ customerName: 'Priya Nair', assignedAgentName: 'Sam Carter' })
  })

  it('includes tickets with no agent', async () => {
    const response = await list(admin, '?search=password')

    expect(response.body.data.items[0]).toMatchObject({ id: ticket(1007), assignedAgentId: null, assignedAgentName: null })
  })

  it('paginates, covering each ticket exactly once', async () => {
    const pageOne = await list(admin, '?limit=5&page=1')
    const pageTwo = await list(admin, '?limit=5&page=2')

    expect(pageOne.body.data).toMatchObject({ page: 1, totalPages: 2, totalItems: 8 })
    expect([...ids(pageOne), ...ids(pageTwo)]).toEqual([1008, 1007, 1006, 1005, 1004, 1003, 1002, 1001])
  })

  it('returns an empty page past the end', async () => {
    const response = await list(admin, '?limit=5&page=9')

    expect(response.status).toBe(200)
    expect(ids(response)).toEqual([])
    expect(response.body.data.totalItems).toBe(8)
  })

  it('searches titles, ignoring case', async () => {
    expect(ids(await list(admin, '?search=INVOICE'))).toEqual([1008])
  })

  it('filters by status and priority', async () => {
    expect(ids(await list(admin, '?status=open'))).toEqual([1008, 1007, 1002])
    expect(ids(await list(admin, '?status=open&priority=high'))).toEqual([1008])
  })

  it('treats regular expressions and query syntax in a search as plain text', async () => {
    for (const search of ["' OR 1=1 --", '.*', '^', '(', '[a-z]', '$where', '{"$ne":""}']) {
      const response = await list(admin, `?search=${encodeURIComponent(search)}`)
      expect(response.status).toBe(200)
      expect(response.body.data.totalItems).toBe(0)
    }
    expect((await list(admin)).body.data.totalItems).toBe(8)
  })

  it.each(['status=banana', 'priority=x', 'page=0', 'page=abc', 'limit=1000', 'scope=x', 'sort=x'])('rejects the invalid option %s', async (query) => {
    expect((await list(admin, `?${query}`)).status).toBe(400)
  })

  it('shows customers only their own tickets, whatever they ask for', async () => {
    expect(ids(await list(priya))).toEqual([1008, 1006, 1002])
    expect(ids(await list(priya, '?scope=all'))).toEqual([1008, 1006, 1002])
  })

  it('shows agents the tickets assigned to them under "mine"', async () => {
    expect(ids(await list(agent, '?scope=mine'))).toEqual([1008, 1005, 1003])
  })
})

describe('GET /api/tickets/:id', () => {
  it('returns a ticket to its owner', async () => {
    const response = await api.get(`/api/tickets/${ticket(1006)}`).set(asUser(priya))

    expect(response.status).toBe(200)
    expect(response.body.data.title).toBe('App crashes when uploading a file')
  })

  it('makes another customer\'s ticket look the same as a missing one', async () => {
    const other = await api.get(`/api/tickets/${ticket(1006)}`).set(asUser(liam))
    const missing = await api.get(`/api/tickets/${ticket(99999)}`).set(asUser(liam))

    expect(other.status).toBe(404)
    expect(other.body).toEqual(missing.body)
  })

  it.each(['abc', '-1', '1.5', '99999999999'])('rejects the invalid ID %s', async (id) => {
    expect((await api.get(`/api/tickets/${id}`).set(asUser(admin))).status).toBe(400)
  })
})

describe('POST /api/tickets', () => {
  it('lets a customer create a ticket', async () => {
    const response = await api.post('/api/tickets').set(asUser(priya)).send({ ...newTicket, title: '  Printer is on fire ' })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({ title: 'Printer is on fire', status: 'open', customerId: user(4), assignedAgentId: null })
  })

  it('ignores fields a customer must not set', async () => {
    const response = await api.post('/api/tickets').set(asUser(priya)).send({ ...newTicket, status: 'resolved', customerId: 1, assignedAgentId: 2 })

    expect(response.body.data).toMatchObject({ status: 'open', customerId: user(4), assignedAgentId: null })
  })

  it('does not let agents or admins create tickets', async () => {
    expect((await api.post('/api/tickets').set(asUser(agent)).send(newTicket)).status).toBe(403)
    expect((await api.post('/api/tickets').set(asUser(admin)).send(newTicket)).status).toBe(403)
  })

  it('reports each invalid field', async () => {
    const response = await api.post('/api/tickets').set(asUser(priya)).send({ title: 'x' })

    expect(response.status).toBe(400)
    expect(Object.keys(response.body.error.details).sort()).toEqual(['category', 'description', 'priority', 'title'])
  })
})

describe('PUT /api/tickets/:id', () => {
  it('changes only the fields that were sent, and moves updatedAt', async () => {
    const before = (await api.get(`/api/tickets/${ticket(1007)}`).set(asUser(admin))).body.data

    const response = await update(admin, 1007, { status: 'in_progress' })

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({ status: 'in_progress', title: before.title, priority: before.priority, createdAt: before.createdAt })
    expect(response.body.data.updatedAt > before.updatedAt).toBe(true)
  })

  it('rejects an update with nothing valid to change', async () => {
    expect((await update(admin, 1007, {})).status).toBe(400)
    expect((await update(admin, 1007, { customerId: 1 })).status).toBe(400)
    expect((await update(admin, 1007, { status: 'banana' })).status).toBe(400)
  })

  describe('as a customer', () => {
    it('can edit the text of their own open ticket', async () => {
      const response = await update(priya, 1008, { title: 'A better title' })

      expect(response.status).toBe(200)
      expect(response.body.data.title).toBe('A better title')
    })

    it('cannot change the status or the agent', async () => {
      expect((await update(priya, 1008, { status: 'resolved' })).status).toBe(403)
      expect((await update(priya, 1008, { assignedAgentId: user(2) })).status).toBe(403)
    })

    it('cannot edit a ticket that is no longer open', async () => {
      expect((await update(priya, 1006, { title: 'A better title' })).status).toBe(403)
    })

    it('cannot edit another customer\'s ticket', async () => {
      expect((await update(liam, 1008, { title: 'A better title' })).status).toBe(404)
    })
  })

  describe('as an agent', () => {
    it('can change the status', async () => {
      expect((await update(agent, 1007, { status: 'resolved' })).body.data.status).toBe('resolved')
    })

    it('can assign a ticket to themselves only', async () => {
      expect((await update(agent, 1007, { assignedAgentId: user(2) })).body.data.assignedAgentName).toBe('Sam Carter')
      expect((await update(agent, 1007, { assignedAgentId: user(3) })).status).toBe(403)
      expect((await update(agent, 1007, { assignedAgentId: null })).status).toBe(403)
    })

    it('cannot edit the text', async () => {
      expect((await update(agent, 1007, { title: 'A better title' })).status).toBe(403)
    })
  })

  describe('as an admin', () => {
    it('can assign any agent, and unassign', async () => {
      expect((await update(admin, 1007, { assignedAgentId: user(3) })).body.data.assignedAgentName).toBe('Maya Lee')
      expect((await update(admin, 1007, { assignedAgentId: null })).body.data.assignedAgentName).toBeNull()
    })

    it('cannot assign someone who is not an agent', async () => {
      expect((await update(admin, 1007, { assignedAgentId: user(4) })).status).toBe(400)
    })
  })
})

describe('DELETE /api/tickets/:id', () => {
  it('lets an admin delete a ticket, along with its comments', async () => {
    const response = await api.delete(`/api/tickets/${ticket(1006)}`).set(asUser(admin))

    expect(response.status).toBe(204)
    expect(response.text).toBe('')
    expect((await api.get(`/api/tickets/${ticket(1006)}`).set(asUser(admin))).status).toBe(404)
    expect((await api.get(`/api/tickets/${ticket(1006)}/comments`).set(asUser(admin))).status).toBe(404)
  })

  it('does not let customers or agents delete', async () => {
    expect((await api.delete(`/api/tickets/${ticket(1006)}`).set(asUser(priya))).status).toBe(403)
    expect((await api.delete(`/api/tickets/${ticket(1006)}`).set(asUser(agent))).status).toBe(403)
    expect((await api.get(`/api/tickets/${ticket(1006)}`).set(asUser(admin))).status).toBe(200)
  })

  it('returns 404 for a ticket that does not exist', async () => {
    expect((await api.delete(`/api/tickets/${ticket(99999)}`).set(asUser(admin))).status).toBe(404)
  })
})

describe('comments', () => {
  it('lists a ticket\'s comments in order, with authors', async () => {
    const response = await api.get(`/api/tickets/${ticket(1006)}/comments`).set(asUser(priya))

    expect(response.status).toBe(200)
    expect(response.body.data.map((comment) => comment.authorName)).toEqual(['Priya Nair', 'Maya Lee'])
  })

  it('takes the author from the token, not the request', async () => {
    const response = await api.post(`/api/tickets/${ticket(1006)}/comments`).set(asUser(agent)).send({ message: ' On it. ', userId: 1, authorName: 'Fake' })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({ message: 'On it.', userId: user(2), authorName: 'Sam Carter' })
  })

  it('rejects an empty comment', async () => {
    expect((await api.post(`/api/tickets/${ticket(1006)}/comments`).set(asUser(priya)).send({ message: '   ' })).status).toBe(400)
  })

  it('hides another customer\'s comments, and blocks commenting there', async () => {
    expect((await api.get(`/api/tickets/${ticket(1006)}/comments`).set(asUser(liam))).status).toBe(404)
    expect((await api.post(`/api/tickets/${ticket(1006)}/comments`).set(asUser(liam)).send({ message: 'Hello' })).status).toBe(404)
  })
})

describe('GET /api/dashboard/stats', () => {
  it('counts all tickets for agents and admins', async () => {
    const expected = { total: 8, open: 3, inProgress: 3, resolved: 2 }

    expect((await api.get('/api/dashboard/stats').set(asUser(admin))).body.data).toEqual(expected)
    expect((await api.get('/api/dashboard/stats').set(asUser(agent))).body.data).toEqual(expected)
  })

  it('counts only a customer\'s own tickets', async () => {
    expect((await api.get('/api/dashboard/stats').set(asUser(priya))).body.data).toEqual({ total: 3, open: 2, inProgress: 1, resolved: 0 })
  })
})

describe('GET /api/users', () => {
  it('lets only admins list users', async () => {
    expect((await api.get('/api/users').set(asUser(admin))).status).toBe(200)
    expect((await api.get('/api/users').set(asUser(agent))).status).toBe(403)
    expect((await api.get('/api/users').set(asUser(priya))).status).toBe(403)
  })

  it('filters by role', async () => {
    const response = await api.get('/api/users?role=agent').set(asUser(admin))

    expect(response.body.data.map((user) => user.name)).toEqual(['Sam Carter', 'Maya Lee'])
  })

  it('never includes password hashes', async () => {
    const response = await api.get('/api/users').set(asUser(admin))

    expect(Object.keys(response.body.data[0]).sort()).toEqual(['createdAt', 'email', 'id', 'name', 'role'])
    expect(response.text).not.toMatch(/\$2[aby]\$/)
  })
})
