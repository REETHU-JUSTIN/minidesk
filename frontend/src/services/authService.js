import { api, clearToken, getToken, saveToken } from './api'

// The rest of the app only talks to these service files, never to Axios directly.

export async function login(input) {
  const response = await api.post('/auth/login', input)
  saveToken(response.data.data.token)
  return response.data.data.user
}

export async function register(input) {
  const response = await api.post('/auth/register', input)
  saveToken(response.data.data.token)
  return response.data.data.user
}

// Used on startup, to restore the session after a page refresh.
export async function getCurrentUser() {
  if (!getToken()) return null

  const response = await api.get('/auth/me')
  return response.data.data
}

export function logout() {
  clearToken()
}
