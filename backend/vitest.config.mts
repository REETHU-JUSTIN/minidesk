import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Creates the test database once, before any test runs.
    globalSetup: './tests/globalSetup.ts',
    // These test files share one database, so they must run one after another.
    fileParallelism: false,
    testTimeout: 15000,
    // These take priority over backend/.env, so tests can never touch your development data.
    env: {
      NODE_ENV: 'test',
      DB_NAME: 'minidesk_test',
      JWT_SECRET: 'test-only-secret-that-is-at-least-32-characters-long',
      JWT_EXPIRES_IN: '1h',
    },
  },
})
