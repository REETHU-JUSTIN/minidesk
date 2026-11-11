import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db'
import { env } from '../config/env'
import type { LoginInput, PublicUser, RegisterInput } from '../types'
import { AppError } from '../utils/AppError'

// Higher is slower for attackers, and for us. 10 is a common starting point.
const SALT_ROUNDS = 10

// PostgreSQL's error code for breaking a UNIQUE rule.
const UNIQUE_VIOLATION = '23505'

// Compared against when an email doesn't exist, so that a login takes about the same
// time either way. Otherwise response times would reveal which emails have accounts.
const unusedPasswordHash = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS)

// Listing columns by name means a query can't return password_hash by accident.
// AS "createdAt" renames database naming to the names the API uses.
export const PUBLIC_USER_COLUMNS = 'id, name, email, role, created_at AS "createdAt"'

function createToken(userId: number): string {
  // "sub" (subject) is the standard field for who a token belongs to.
  // A token can be read by anyone, so it must never contain anything secret.
  return jwt.sign({}, env.jwtSecret, { subject: String(userId), expiresIn: env.jwtExpiresIn, algorithm: 'HS256' })
}

export async function register({ name, email, password }: RegisterInput) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  try {
    // $1, $2 and $3 are parameters. The values travel separately from the SQL,
    // so text from a user can never run as SQL. This is what stops SQL injection.
    const result = await pool.query<PublicUser>(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'customer')
       RETURNING ${PUBLIC_USER_COLUMNS}`,
      [name, email, passwordHash],
    )
    const user = result.rows[0]
    return { token: createToken(user.id), user }
  } catch (error) {
    // Letting the database enforce uniqueness also covers two sign-ups arriving at once,
    // which checking first and inserting afterward wouldn't.
    if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
      throw new AppError(409, 'An account with this email already exists.')
    }
    throw error
  }
}

export async function login({ email, password }: LoginInput) {
  const result = await pool.query<PublicUser & { passwordHash: string }>(
    `SELECT ${PUBLIC_USER_COLUMNS}, password_hash AS "passwordHash" FROM users WHERE email = $1`,
    [email],
  )
  const foundUser = result.rows[0]
  const passwordMatches = await bcrypt.compare(password, foundUser?.passwordHash ?? unusedPasswordHash)

  // The same message for both cases, so nobody can find out which emails are registered.
  if (!foundUser || !passwordMatches) {
    throw new AppError(401, 'The email or password is incorrect.')
  }

  // Rest syntax separates the hash from everything else, so it can't reach the response.
  const { passwordHash: _passwordHash, ...user } = foundUser
  return { token: createToken(user.id), user }
}

export async function getUserById(userId: number): Promise<PublicUser | null> {
  const result = await pool.query<PublicUser>(`SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = $1`, [userId])
  return result.rows[0] ?? null
}
