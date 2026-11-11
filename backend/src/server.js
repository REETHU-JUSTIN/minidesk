import { app } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/db.js'
import { env } from './config/env.js'

async function start() {
  // Connect first, so a bad setting gives a clear message right away.
  await connectDatabase()

  const server = app.listen(env.port, (error) => {
    if (error) {
      console.error(`The server couldn't start on port ${env.port}:`, error.message)
      process.exit(1)
    }
    console.log(`MiniDesk API running at http://localhost:${env.port}`)
  })

  // Docker and hosting services send SIGTERM before stopping a server, for example
  // during a new deployment. Finishing current requests first means none are cut off.
  function shutDown(signal) {
    console.log(`${signal} received, finishing current requests...`)
    server.close(async () => {
      await disconnectDatabase()
      process.exit(0)
    })
    // If something hangs, stop anyway after 10 seconds.
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGTERM', () => shutDown('SIGTERM'))
  process.on('SIGINT', () => shutDown('SIGINT'))
}

start().catch((error) => {
  console.error('The server failed to start:', error.message)
  console.error('Check MONGODB_URI in backend/.env, and that MongoDB is running.')
  process.exit(1)
})
