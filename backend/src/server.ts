import { app } from './app'
import { env } from './config/env'
import { initializeStore } from './services/devStore'

async function start() {
  await initializeStore()

  app.listen(env.port, (error) => {
    if (error) {
      console.error(`The server couldn't start on port ${env.port}:`, error.message)
      process.exit(1)
    }
    console.log(`MiniDesk API running at http://localhost:${env.port}`)
  })
}

start().catch((error) => {
  console.error('The server failed to start:', error)
  process.exit(1)
})
