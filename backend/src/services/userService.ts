import type { PublicUser, UserRole } from '../types'
import { toPublicUser } from './authService'
import { store } from './devStore'

export async function listUsers(role?: UserRole): Promise<PublicUser[]> {
  const users = role ? store.users.filter((user) => user.role === role) : store.users
  return users.map(toPublicUser)
}
