import { app } from './app'
import { pool } from './config/db'
import { env } from './config/env'

async function start() {
  // Check the database first, so a bad setting gives a clear message right away.
  await pool.query('SELECT 1')

  const server = app.listen(env.port, (error) => {
    if (error) {
      console.error(`The server couldn't start on port ${env.port}:`, error.message)
      process.exit(1)
    }
    console.log(`MiniDesk API running at http://localhost:${env.port}`)
  })

  // Docker and hosting services send SIGTERM before stopping a server, for example
  // during a new deployment. Finishing current requests first means none are cut off.
  function shutDown(signal: string) {
    console.log(`${signal} received, finishing current requests...`)
    server.close(async () => {
      await pool.end()
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
  console.error('Check the database settings in backend/.env, and that you have run: npm run db:reset')
  process.exit(1)
})
