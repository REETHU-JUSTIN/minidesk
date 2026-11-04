import { createContext } from 'react'
import type { LoginInput, RegisterInput, User } from '../types'

export interface AuthContextValue {
  user: User | null
  isRestoringSession: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

// Components read this through the useAuth hook. It's in its own file because
// React's fast refresh works best when a component file only exports components.
export const AuthContext = createContext<AuthContextValue | null>(null)
