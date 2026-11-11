import mongoose from 'mongoose'
import { env } from './env.js'

// Mongoose keeps a pool of connections open and shares them between requests.
// Giving up after 5 seconds means a bad address fails quickly, with a clear message.
export async function connectDatabase() {
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000 })
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}

// Reports connection problems after startup, which would otherwise go unnoticed.
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error.message)
})
