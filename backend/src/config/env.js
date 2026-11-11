import dotenv from 'dotenv'

// Loads the values in .env into process.env. Secrets live there, never in code.
// On a hosting service, there is no .env file: the host provides these values instead.
dotenv.config({ quiet: true })

function requireEnv(name) {
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
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '1d'),
  // One address holds the server, the database name and any login details.
  mongodbUri: requireEnv('MONGODB_URI'),
  // How many proxies sit in front of the app. Hosting services usually add one.
  // Needed so the rate limiter sees each visitor's real address, not the proxy's.
  trustProxy: Number(process.env.TRUST_PROXY ?? 0),
  // Failed login attempts allowed per address in 15 minutes.
  loginAttemptLimit: Number(process.env.LOGIN_ATTEMPT_LIMIT ?? 10),
}
