import { execSync } from 'node:child_process'

// Runs once before all tests. The other database settings come from backend/.env.
export default function globalSetup() {
  execSync('npm run --silent db:reset', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DB_NAME: 'minidesk_test',
      JWT_SECRET: 'test-only-secret-that-is-at-least-32-characters-long',
    },
  })
}
