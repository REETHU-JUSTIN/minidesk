import type { ApiResponse, AuthResult, LoginInput, RegisterInput, User } from '../types'
import { api, clearToken, getToken, saveToken } from './api'

// The rest of the app only talks to these service files, never to Axios directly.

export async function login(input: LoginInput): Promise<User> {
  const response = await api.post<ApiResponse<AuthResult>>('/auth/login', input)
  saveToken(response.data.data.token)
  return response.data.data.user
}

export async function register(input: RegisterInput): Promise<User> {
  const response = await api.post<ApiResponse<AuthResult>>('/auth/register', input)
  saveToken(response.data.data.token)
  return response.data.data.user
}

// Used on startup, to restore the session after a page refresh.
export async function getCurrentUser(): Promise<User | null> {
  if (!getToken()) return null

  const response = await api.get<ApiResponse<User>>('/auth/me')
  return response.data.data
}

export function logout(): void {
  clearToken()
}
