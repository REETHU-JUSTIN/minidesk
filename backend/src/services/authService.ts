import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { LoginInput, PublicUser, RegisterInput } from '../types'
import { AppError } from '../utils/AppError'
import { store } from './devStore'
import type { UserRecord } from './devStore'

// Higher is slower for attackers, and for us. 10 is a common starting point.
const SALT_ROUNDS = 10

// Compared against when an email doesn't exist, so that a login takes about the same
// time either way. Otherwise response times would reveal which emails have accounts.
const unusedPasswordHash = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS)

// Every user leaving a service passes through here, so a password hash can't leak.
export function toPublicUser({ id, name, email, role, createdAt }: UserRecord): PublicUser {
  return { id, name, email, role, createdAt }
}

function createToken(userId: number): string {
  // "sub" (subject) is the standard field for who a token belongs to.
  // A token can be read by anyone, so it must never contain anything secret.
  return jwt.sign({}, env.jwtSecret, { subject: String(userId), expiresIn: env.jwtExpiresIn, algorithm: 'HS256' })
}

export async function register({ name, email, password }: RegisterInput) {
  if (store.users.some((user) => user.email === email)) {
    throw new AppError(409, 'An account with this email already exists.')
  }

  const newUser: UserRecord = {
    id: Math.max(0, ...store.users.map((user) => user.id)) + 1,
    name,
    email,
    passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    role: 'customer', // public sign-up can only ever create customers
    createdAt: new Date().toISOString(),
  }
  store.users.push(newUser)

  return { token: createToken(newUser.id), user: toPublicUser(newUser) }
}

export async function login({ email, password }: LoginInput) {
  const user = store.users.find((item) => item.email === email)
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? unusedPasswordHash)

  // The same message for both cases, so nobody can find out which emails are registered.
  if (!user || !passwordMatches) {
    throw new AppError(401, 'The email or password is incorrect.')
  }

  return { token: createToken(user.id), user: toPublicUser(user) }
}

export async function getUserById(userId: number): Promise<PublicUser | null> {
  const user = store.users.find((item) => item.id === userId)
  return user ? toPublicUser(user) : null
}
