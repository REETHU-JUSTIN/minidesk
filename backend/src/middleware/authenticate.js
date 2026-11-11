import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { getUserById } from '../services/authService.js'
import { AppError } from '../utils/AppError.js'
import { isValidId } from '../utils/validators.js'

// Answers "who is making this request?". Every protected route runs this first.
export const authenticate = async (req, _res, next) => {
  // Clients send their token in a header: Authorization: Bearer <token>
  const [scheme, token] = (req.headers.authorization ?? '').split(' ')

  if (scheme !== 'Bearer' || !token) {
    next(new AppError(401, 'Please sign in to continue.'))
    return
  }

  let userId
  try {
    // verify checks the signature and expiry, and throws if either is wrong.
    // Allowing only HS256 stops an attacker from choosing a weaker algorithm.
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] })
    userId = typeof payload === 'string' ? undefined : payload.sub
  } catch {
    next(new AppError(401, 'Your session has expired. Please sign in again.'))
    return
  }

  // Load the user each time, so a deleted user or changed role takes effect immediately.
  const user = isValidId(userId) ? await getUserById(userId) : null
  if (!user) {
    next(new AppError(401, 'Your session has expired. Please sign in again.'))
    return
  }

  req.user = user
  next()
}

// For code that runs after authenticate, where a user always exists.
export function getCurrentUser(req) {
  if (!req.user) throw new AppError(401, 'Please sign in to continue.')
  return req.user
}
