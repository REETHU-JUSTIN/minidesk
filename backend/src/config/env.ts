import dotenv from 'dotenv'
import type { SignOptions } from 'jsonwebtoken'

// Loads the values in .env into process.env. Secrets live there, never in code.
dotenv.config({ quiet: true })

function requireEnv(name: string): string {
  const value = process.env[name]
  // Stopping at startup is much better than failing later on someone's request.
  if (!value) throw new Error(`Missing environment variable: ${name}. See .env.example.`)
  return value
}

const jwtSecret = requireEnv('JWT_SECRET')
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long.')
}

const seedUserPassword = requireEnv('SEED_USER_PASSWORD')
if (seedUserPassword.length < 8) {
  throw new Error('SEED_USER_PASSWORD must be at least 8 characters long.')
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  jwtSecret,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as SignOptions['expiresIn'],
  seedUserPassword,
}
