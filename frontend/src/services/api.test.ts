import axios, { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { adminUser } from '../test/testUtils'
import { api, getToken, saveToken, setSessionExpiredHandler } from './api'
import * as authService from './authService'

// An Axios adapter normally sends the HTTP request. This one answers immediately and
// records what was sent, so the real interceptors run without any network.
let sentConfig: InternalAxiosRequestConfig | undefined

function respondWith(status: number, data: unknown) {
  api.defaults.adapter = async (config) => {
    sentConfig = config
    const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse
    if (status >= 400) throw new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, response)
    return response
  }
}

function failWithNoResponse() {
  api.defaults.adapter = async (config) => {
    throw new AxiosError('Network Error', 'ERR_NETWORK', config)
  }
}

afterEach(() => {
  setSessionExpiredHandler(null)
  sentConfig = undefined
})

describe('request interceptor', () => {
  it('attaches the token when there is one', async () => {
    saveToken('my-token')
    respondWith(200, { data: 'ok' })

    await api.get('/anything')

    expect(sentConfig?.headers.Authorization).toBe('Bearer my-token')
  })

  it('sends no Authorization header when signed out', async () => {
    respondWith(200, { data: 'ok' })

    await api.get('/anything')

    expect(sentConfig?.headers.Authorization).toBeUndefined()
  })
})

describe('API response handling', () => {
  it('uses the error message from the server', async () => {
    respondWith(404, { error: { message: 'We couldn\'t find that ticket.' } })

    await expect(api.get('/tickets/1')).rejects.toThrow('We couldn\'t find that ticket.')
  })

  it('prefers field errors over the general message', async () => {
    respondWith(400, { error: { message: 'Please check the fields.', details: { title: 'Title is too short.', priority: 'Choose a priority.' } } })

    await expect(api.post('/tickets')).rejects.toThrow('Title is too short. Choose a priority.')
  })

  it('has a fallback for an error with no message', async () => {
    respondWith(502, 'Bad Gateway')

    await expect(api.get('/tickets')).rejects.toThrow('Something went wrong. Please try again.')
  })

  it('explains when the server cannot be reached', async () => {
    failWithNoResponse()

    await expect(api.get('/tickets')).rejects.toThrow('We can\'t reach the server.')
  })

  it('lets a cancelled request pass through as a cancellation', async () => {
    api.defaults.adapter = async () => {
      throw new axios.CanceledError('cancelled')
    }

    await expect(api.get('/tickets')).rejects.toSatisfy((error) => axios.isCancel(error))
  })
})

describe('expired sessions', () => {
  it('clears the token and signs out on a 401 for the current token', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)
    saveToken('expired-token')
    respondWith(401, { error: { message: 'Your session has expired.' } })

    await expect(api.get('/tickets')).rejects.toThrow('Your session has expired.')

    expect(getToken()).toBeNull()
    expect(onExpired).toHaveBeenCalledOnce()
  })

  it('does not sign out on a failed login, which sends no token', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)
    respondWith(401, { error: { message: 'The email or password is incorrect.' } })

    await expect(api.post('/auth/login')).rejects.toThrow('The email or password is incorrect.')

    expect(onExpired).not.toHaveBeenCalled()
  })

  it('ignores a late 401 from an old token after signing in again', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)
    saveToken('old-token')
    // The token changes while this request is on its way.
    api.defaults.adapter = async (config) => {
      saveToken('new-token')
      const response = { status: 401, data: {}, statusText: '', headers: {}, config } as AxiosResponse
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, response)
    }

    await expect(api.get('/tickets')).rejects.toThrow()

    expect(getToken()).toBe('new-token')
    expect(onExpired).not.toHaveBeenCalled()
  })

  it('does not sign out on other errors', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)
    saveToken('good-token')
    respondWith(500, { error: { message: 'Something went wrong.' } })

    await expect(api.get('/tickets')).rejects.toThrow()

    expect(getToken()).toBe('good-token')
    expect(onExpired).not.toHaveBeenCalled()
  })
})

describe('authService', () => {
  it('saves the token and returns the user after login', async () => {
    respondWith(200, { data: { token: 'new-token', user: adminUser } })

    const user = await authService.login({ email: 'admin@example.com', password: 'x' })

    expect(user).toEqual(adminUser)
    expect(getToken()).toBe('new-token')
  })

  it('does not call the API on startup when there is no token', async () => {
    respondWith(200, { data: adminUser })

    await expect(authService.getCurrentUser()).resolves.toBeNull()

    expect(sentConfig).toBeUndefined()
  })

  it('restores the user on startup when there is a token', async () => {
    saveToken('my-token')
    respondWith(200, { data: adminUser })

    await expect(authService.getCurrentUser()).resolves.toEqual(adminUser)
    expect(sentConfig?.url).toBe('/auth/me')
  })

  it('removes the token on logout', () => {
    saveToken('my-token')

    authService.logout()

    expect(getToken()).toBeNull()
  })
})
