import { pool } from '../config/db'
import type { PublicUser, UserRole } from '../types'
import { PUBLIC_USER_COLUMNS } from './authService'

export async function listUsers(role?: UserRole): Promise<PublicUser[]> {
  const result = await pool.query<PublicUser>(
    `SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE ($1::text IS NULL OR role = $1) ORDER BY id`,
    [role ?? null],
  )
  return result.rows
}
