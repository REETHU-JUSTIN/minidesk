import { User } from '../models/User.js'
import { toPublicUser } from './authService.js'

export async function listUsers(role) {
  const users = await User.find(role ? { role } : {}).sort({ createdAt: 1, _id: 1 })
  return users.map(toPublicUser)
}
