// Creates the indexes on a new database. Safe for production: it adds no sample data,
// never deletes anything, and can be run again without harm.
// Run with: npm run build, then npm run db:setup
import { connectDatabase, disconnectDatabase } from '../config/db'
import { Ticket } from '../models/Ticket'
import { User } from '../models/User'

async function main() {
  await connectDatabase()
  // MongoDB creates collections automatically. Indexes are what need setting up.
  await Promise.all([User.init(), Ticket.init()])
  console.log('The indexes are ready. Next, create an admin with: npm run user:create')
}

main()
  .catch((error) => {
    console.error('The database setup failed:', error.message)
    process.exitCode = 1
  })
  .finally(() => disconnectDatabase())
