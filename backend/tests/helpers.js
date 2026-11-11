import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../src/app.js'
import { connectDatabase, disconnectDatabase } from '../src/config/db.js'
import { loadSampleData } from '../src/scripts/loadSampleData.js'
import { DEMO_PASSWORD, ticketId, userId } from '../src/scripts/sampleData.js'

export { DEMO_PASSWORD }

// Supertest sends real HTTP requests to the app, without starting a server on a port.
export const api = request(app)

// The sample data's fixed IDs, as the text the API uses.
export const ticket = (number) => ticketId(number).toString()
export const user = (number) => userId(number).toString()

// Gives each test the same known starting data.
export async function resetData() {
  if (mongoose.connection.readyState === 0) await connectDatabase()

  // This deletes everything, so it refuses to run on anything but a test database.
  if (!mongoose.connection.name.endsWith('_test')) {
    throw new Error(`Refusing to reset "${mongoose.connection.name}". Tests may only use a database ending in _test.`)
  }
  await loadSampleData()
}

export async function tokenFor(email) {
  const response = await api.post('/api/auth/login').send({ email, password: DEMO_PASSWORD })
  return response.body.data.token
}

export const closeDatabase = () => disconnectDatabase()
