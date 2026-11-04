import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import type { User } from '../types'

export function useAuth() {
  const context = useContext(AuthContext)
  // A clear message is much easier to debug than "cannot read properties of null".
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}

// For components that only render on protected pages, where a user always exists.
// This saves them from checking for null every time.
export function useCurrentUser(): User {
  const { user } = useAuth()
  if (!user) throw new Error('useCurrentUser must be used on a protected page.')
  return user
}
