// The rest of the app only talks to these service files, never to the backend directly.
// In Phase 7, these function bodies become Axios requests and nothing else has to change.
import type { LoginInput, RegisterInput, User } from '../types'
import { restoreSession, signIn, signOut, signUp } from './previewBackend'

export function login({ email }: LoginInput): Promise<User> {
  return signIn(email)
}

export function register(input: RegisterInput): Promise<User> {
  return signUp(input)
}

export function getCurrentUser(): Promise<User | null> {
  return restoreSession()
}

export function logout(): void {
  signOut()
}
