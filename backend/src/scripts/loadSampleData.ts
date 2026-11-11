import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { Ticket } from '../models/Ticket'
import { User } from '../models/User'
import { DEMO_PASSWORD, sampleTickets, sampleUsers } from './sampleData'

let demoPasswordHash: string | undefined

// Replaces all users and tickets in the connected database with the sample data.
export async function loadSampleData(): Promise<void> {
  // This deletes data. MongoDB servers often hold several projects' databases,
  // so it refuses to run on any database that isn't clearly MiniDesk's.
  const databaseName = mongoose.connection.name
  if (!databaseName.startsWith('minidesk')) {
    throw new Error(`Refusing to reset "${databaseName}". The database name must start with "minidesk".`)
  }

  demoPasswordHash ??= await bcrypt.hash(DEMO_PASSWORD, 10)

  // Building the indexes first means the unique email rule always applies.
  await Promise.all([User.init(), Ticket.init()])
  await Promise.all([User.deleteMany({}), Ticket.deleteMany({})])

  await User.insertMany(sampleUsers.map((user) => ({ ...user, passwordHash: demoPasswordHash })))
  // timestamps: false keeps the sample dates, instead of setting them to now.
  await Ticket.insertMany(sampleTickets, { timestamps: false } as object)
}
