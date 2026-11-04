import { useEffect, useState } from 'react'

// Returns the value only after it has stopped changing for "delay" milliseconds.
// In Phase 7 this stops the app from calling the API on every keystroke.
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)

    // A new keystroke runs this cleanup first, which cancels the waiting timer.
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
