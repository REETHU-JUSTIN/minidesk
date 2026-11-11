import { Pool, types } from 'pg'
import type { PoolConfig } from 'pg'
import { env } from './env'

// PostgreSQL's driver returns dates as Date objects. The API promises ISO text,
// so this converts every timestamp in one place.
types.setTypeParser(types.builtins.TIMESTAMPTZ, (value) => new Date(value).toISOString())

// One address on a hosting service, or separate settings locally.
export const connectionConfig: PoolConfig = {
  ...(env.databaseUrl
    ? { connectionString: env.databaseUrl }
    : { host: env.dbHost, port: env.dbPort, database: env.dbName, user: env.dbUser, password: env.dbPassword }),
  // rejectUnauthorized keeps the certificate check on, so the connection can't be intercepted.
  ssl: env.dbSsl ? { rejectUnauthorized: true } : undefined,
}

// A pool keeps several database connections open and shares them between requests.
// Opening a new connection for every request would be much slower.
export const pool = new Pool(connectionConfig)

// Reports problems with idle connections, which would otherwise crash the server.
pool.on('error', (error) => {
  console.error('Unexpected database connection error:', error.message)
})
