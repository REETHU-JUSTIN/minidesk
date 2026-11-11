import { Schema, model } from 'mongoose'
import type { UserRole } from '../types'

export interface UserRecord {
  name: string
  email: string
  passwordHash: string
  role: UserRole
  createdAt: Date
}

// MongoDB itself accepts any shape of document. A Mongoose schema adds the rules:
// which fields exist, their types, and which values are allowed.
const userSchema = new Schema<UserRecord>(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 100 },
    // unique creates an index that refuses duplicates, and makes finding a user by email fast.
    email: { type: String, required: true, unique: true, lowercase: true },
    // select: false leaves this out of every query unless one asks for it by name,
    // so a password hash can't be returned by accident.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'agent', 'customer'], default: 'customer', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export const User = model<UserRecord>('User', userSchema)
