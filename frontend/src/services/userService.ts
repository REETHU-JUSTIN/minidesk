import type { ApiResponse, User, UserRole } from '../types'
import { api } from './api'

export async function getUsers(role?: UserRole): Promise<User[]> {
  const response = await api.get<ApiResponse<User[]>>('/users', { params: { role } })
  return response.data.data
}
