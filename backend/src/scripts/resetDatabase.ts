// Creates the database if needed, then rebuilds its tables and sample data.
// Run with: npm run db:reset
//
// WARNING: this deletes all data in the database named by DB_NAME.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Client } from 'pg'
import { env } from '../config/env'

const databaseFolder = join(__dirname, '../../../database')

function connectTo(database: string): Client {
  return new Client({ host: env.dbHost, port: env.dbPort, user: env.dbUser, password: env.dbPassword, database })
}

async function createDatabaseIfMissing() {
  // A database can't create itself, so this connects to the built-in "postgres" database first.
  const client = connectTo('postgres')
  await client.connect()
  try {
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [env.dbName])
    if (existing.rowCount === 0) {
      // Names like this can't be sent as query parameters, so the name is checked first.
      if (!/^[a-z_][a-z0-9_]*$/.test(env.dbName)) throw new Error('DB_NAME may only contain lowercase letters, numbers and underscores.')
      await client.query(`CREATE DATABASE ${env.dbName}`)
      console.log(`Created database "${env.dbName}".`)
    }
  } finally {
    await client.end()
  }
}

async function loadSqlFiles() {
  const client = connectTo(env.dbName)
  await client.connect()
  try {
    // A transaction means it all works, or nothing changes.
    await client.query('BEGIN')
    await client.query(readFileSync(join(databaseFolder, 'schema.sql'), 'utf8'))
    await client.query(readFileSync(join(databaseFolder, 'seed.sql'), 'utf8'))
    await client.query('COMMIT')
    console.log(`Database "${env.dbName}" is ready, with sample data.`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    await client.end()
  }
}

async function main() {
  // The seed data has a publicly known password, so it must never reach a real deployment.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to reset a production database.')
  }
  await createDatabaseIfMissing()
  await loadSqlFiles()
}

main().catch((error) => {
  console.error('The database reset failed:', error.message)
  process.exit(1)
})
