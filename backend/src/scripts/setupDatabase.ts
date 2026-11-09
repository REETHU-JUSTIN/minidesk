// Creates the tables on a new, empty database. Safe for production:
// it adds no sample data, and it refuses to touch a database that already has tables.
// Run with: npm run build, then npm run db:setup
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Client } from 'pg'
import { connectionConfig } from '../config/db'

async function main() {
  const client = new Client(connectionConfig)
  await client.connect()
  try {
    const existing = await client.query<{ found: string | null }>("SELECT to_regclass('public.users') AS found")
    if (existing.rows[0].found) {
      console.log('The tables already exist, so nothing was changed.')
      return
    }

    // A transaction means it all works, or nothing changes.
    await client.query('BEGIN')
    await client.query(readFileSync(join(__dirname, '../../../database/schema.sql'), 'utf8'))
    await client.query('COMMIT')
    console.log('The tables were created. Next, create an admin with: npm run user:create')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('The database setup failed:', error.message)
  process.exit(1)
})
