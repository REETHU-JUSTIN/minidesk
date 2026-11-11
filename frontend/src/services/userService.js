import { api } from './api'

export async function getUsers(role) {
  const response = await api.get('/users', { params: { role } })
  return response.data.data
}
