import { MongoMemoryServer } from 'mongodb-memory-server'

let server: MongoMemoryServer

// Runs once before all tests. A temporary server means tests need no MongoDB installed,
// and can never touch real data. It overrides any MONGODB_URI in backend/.env.
export async function setup() {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri('minidesk_test')
}

export async function teardown() {
  await server.stop()
}
