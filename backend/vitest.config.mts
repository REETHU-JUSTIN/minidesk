import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Starts a temporary MongoDB server before any test runs, and stops it afterward.
    // Tests never connect to a real database.
    globalSetup: './tests/globalSetup.ts',
    // These test files share one database, so they must run one after another.
    fileParallelism: false,
    testTimeout: 15000,
    // These take priority over backend/.env.
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-only-secret-that-is-at-least-32-characters-long',
      JWT_EXPIRES_IN: '1h',
      // High, so ordinary tests are never blocked. rateLimit.test.ts sets its own low limit.
      LOGIN_ATTEMPT_LIMIT: '1000',
    },
  },
})
