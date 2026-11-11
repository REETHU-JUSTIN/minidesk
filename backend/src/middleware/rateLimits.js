import { rateLimit } from 'express-rate-limit'
import { env } from '../config/env.js'

const tooManyAttempts = {
  error: { message: 'Too many attempts. Please wait a few minutes and try again.' },
}

// Slows down password guessing. Only failed logins count, so a real user who
// signs in successfully is never blocked by their own earlier visits.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.loginAttemptLimit,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7', // tells clients when they can try again
  legacyHeaders: false,
  message: tooManyAttempts,
})

// Stops one address from creating large numbers of accounts.
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.loginAttemptLimit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: tooManyAttempts,
})
