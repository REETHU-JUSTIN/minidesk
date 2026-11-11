import { User } from '../models/User'
import type { PublicUser, UserRole } from '../types'
import { toPublicUser } from './authService'

export async function listUsers(role?: UserRole): Promise<PublicUser[]> {
  const users = await User.find(role ? { role } : {}).sort({ createdAt: 1, _id: 1 })
  return users.map(toPublicUser)
}
