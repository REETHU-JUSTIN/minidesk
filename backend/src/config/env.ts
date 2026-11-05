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

export const env = {
  port: Number(process.env.PORT ?? 5000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  jwtSecret,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as SignOptions['expiresIn'],
  dbHost: process.env.DB_HOST ?? 'localhost',
  dbPort: Number(process.env.DB_PORT ?? 5432),
  dbName: process.env.DB_NAME ?? 'minidesk',
  dbUser: process.env.DB_USER ?? 'postgres',
  dbPassword: requireEnv('DB_PASSWORD'),
}
