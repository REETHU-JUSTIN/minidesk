import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'

// Higher is slower for attackers, and for us. 10 is a common starting point.
const SALT_ROUNDS = 10

// MongoDB's error code for breaking a unique index.
const DUPLICATE_KEY = 11000

// Compared against when an email doesn't exist, so that a login takes about the same
// time either way. Otherwise response times would reveal which emails have accounts.
const unusedPasswordHash = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS)

// Every user leaving a service passes through here, so a password hash can't leak.
export function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() }
}

function createToken(userId) {
  // "sub" (subject) is the standard field for who a token belongs to.
  // A token can be read by anyone, so it must never contain anything secret.
  return jwt.sign({}, env.jwtSecret, { subject: userId, expiresIn: env.jwtExpiresIn, algorithm: 'HS256' })
}

export async function register({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  try {
    const user = await User.create({ name, email, passwordHash, role: 'customer' })
    return { token: createToken(user.id), user: toPublicUser(user) }
  } catch (error) {
    // Letting the database enforce uniqueness also covers two sign-ups arriving at once,
    // which checking first and inserting afterward wouldn't.
    if ((error).code === DUPLICATE_KEY) {
      throw new AppError(409, 'An account with this email already exists.')
    }
    throw error
  }
}

export async function login({ email, password }) {
  // The hash is hidden by default, so this is the one query that asks for it.
  const user = await User.findOne({ email }).select('+passwordHash')
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? unusedPasswordHash)

  // The same message for both cases, so nobody can find out which emails are registered.
  if (!user || !passwordMatches) {
    throw new AppError(401, 'The email or password is incorrect.')
  }

  return { token: createToken(user.id), user: toPublicUser(user) }
}

export async function getUserById(userId) {
  const user = await User.findById(userId)
  return user ? toPublicUser(user) : null
}
