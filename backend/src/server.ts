import { app } from './app'
import { pool } from './config/db'
import { env } from './config/env'

async function start() {
  // Check the database first, so a bad setting gives a clear message right away.
  await pool.query('SELECT 1')

  app.listen(env.port, (error) => {
    if (error) {
      console.error(`The server couldn't start on port ${env.port}:`, error.message)
      process.exit(1)
    }
    console.log(`MiniDesk API running at http://localhost:${env.port}`)
  })
}

start().catch((error) => {
  console.error('The server failed to start:', error.message)
  console.error('Check the DB_ settings in backend/.env, and that you have run: npm run db:reset')
  process.exit(1)
})
