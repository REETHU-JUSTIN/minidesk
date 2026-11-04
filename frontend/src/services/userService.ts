import type { User, UserRole } from '../types'
import { listUsers } from './previewBackend'

export function getUsers(role?: UserRole): Promise<User[]> {
  return listUsers(role)
}
