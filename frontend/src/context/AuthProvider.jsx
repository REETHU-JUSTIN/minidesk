import { useCallback, useEffect, useMemo, useState } from 'react'
import { setSessionExpiredHandler } from '../services/api'
import * as authService from '../services/authService'
import { userLoggedOut } from '../store/actions'
import { useAppDispatch } from '../store/hooks'
import { AuthContext } from './AuthContext'

// Context suits auth because it changes rarely and many components only need to read it.
// Tickets live in Redux instead, so the two never hold copies of the same data.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isRestoringSession, setIsRestoringSession] = useState(true)
  const dispatch = useAppDispatch()

  // When any request finds the session has expired, sign out, and ProtectedRoute
  // sends the user to the login page.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null)
      dispatch(userLoggedOut())
    })
    return () => setSessionExpiredHandler(null)
  }, [dispatch])

  // On first load, check whether someone is already signed in, so a page refresh keeps them signed in.
  useEffect(() => {
    let isCancelled = false

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (!isCancelled) setUser(currentUser)
      })
      .catch(() => {
        // If the server can't be reached, the login page shows. The token is kept,
        // so a refresh signs the user back in once the server is available again.
      })
      .finally(() => {
        if (!isCancelled) setIsRestoringSession(false)
      })

    return () => {
      isCancelled = true
    }
  }, [])

  const login = useCallback(async (input) => {
    setUser(await authService.login(input))
  }, [])

  const register = useCallback(async (input) => {
    setUser(await authService.register(input))
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    dispatch(userLoggedOut())
  }, [dispatch])

  // Every component using this context re-renders when the value changes.
  // useMemo keeps the same object unless something inside it has really changed.
  const value = useMemo(
    () => ({ user, isRestoringSession, login, register, logout }),
    [user, isRestoringSession, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
