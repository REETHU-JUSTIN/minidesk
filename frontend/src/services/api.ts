import axios from 'axios'
import type { AxiosError } from 'axios'

// The shape the API uses for errors. See docs/API_DOCUMENTATION.md.
interface ApiErrorBody {
  error?: { message?: string; details?: Record<string, string> }
}

const TOKEN_KEY = 'minidesk_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// AuthProvider registers a function here, because this file can't use React Hooks.
let onSessionExpired: (() => void) | null = null

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler
}

function getErrorMessage(error: AxiosError<ApiErrorBody>): string {
  // No response at all means the server couldn't be reached.
  if (!error.response) return 'We can\'t reach the server. Please check your connection and try again.'

  const { message, details } = error.response.data?.error ?? {}
  // Field errors are more useful than the general message, so they're shown when present.
  if (details) return Object.values(details).join(' ')
  return message ?? 'Something went wrong. Please try again.'
}

// One configured Axios instance, so every request gets the same address and behavior.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  timeout: 15000,
})

// Runs before every request. Attaching the token here means no service has to remember to.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Runs after every response, so all errors are handled in one place.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    // A cancelled request isn't a failure, so it passes through unchanged.
    if (axios.isCancel(error)) return Promise.reject(error)

    // A 401 on a request that sent the current token means the session is no longer valid.
    // A failed login sends no token, so it stays on the page and shows its error instead.
    const sentCurrentToken = getToken() !== null && error.config?.headers.Authorization === `Bearer ${getToken()}`
    if (error.response?.status === 401 && sentCurrentToken) {
      clearToken()
      onSessionExpired?.()
    }

    return Promise.reject(new Error(getErrorMessage(error)))
  },
)
