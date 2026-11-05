import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Runs after every test, so one test can never affect the next.
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})
