// Replaces the database's contents with sample data, for local development.
// Run with: npm run db:reset
//
// WARNING: this deletes all users and tickets in the database named in MONGODB_URI.
import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/db'
import { loadSampleData } from './loadSampleData'

async function main() {
  // The sample data has a publicly known password, so it must never reach a real deployment.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to reset a production database.')
  }
  await connectDatabase()
  await loadSampleData()
  console.log(`Database "${mongoose.connection.name}" is ready, with sample data.`)
}

main()
  .catch((error) => {
    console.error('The database reset failed:', error.message)
    process.exitCode = 1
  })
  .finally(() => disconnectDatabase())
