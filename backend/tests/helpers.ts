import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import request from 'supertest'
import { app } from '../src/app'
import { pool } from '../src/config/db'
import { env } from '../src/config/env'

export const DEMO_PASSWORD = 'MiniDesk-Demo-2026'

// Supertest sends real HTTP requests to the app, without starting a server on a port.
export const api = request(app)

const databaseFolder = join(__dirname, '../../database')
const schemaSql = readFileSync(join(databaseFolder, 'schema.sql'), 'utf8')
const seedSql = readFileSync(join(databaseFolder, 'seed.sql'), 'utf8')

// Gives each test the same known starting data.
export async function resetData() {
  // This deletes everything, so it refuses to run on anything but a test database.
  if (!env.dbName.endsWith('_test')) {
    throw new Error(`Refusing to reset "${env.dbName}". Tests may only use a database ending in _test.`)
  }
  await pool.query(schemaSql)
  await pool.query(seedSql)
}

export async function tokenFor(email: string): Promise<string> {
  const response = await api.post('/api/auth/login').send({ email, password: DEMO_PASSWORD })
  return response.body.data.token
}

export const closeDatabase = () => pool.end()
