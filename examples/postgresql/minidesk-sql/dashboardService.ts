import { pool } from '../config/db'
import type { DashboardStats, PublicUser } from '../types'

export async function getDashboardStats(user: PublicUser): Promise<DashboardStats> {
  // Customers only count their own tickets. Everyone else passes NULL, which matches all.
  const customerId = user.role === 'customer' ? user.id : null

  // One query calculates all four numbers. FILTER counts only the matching rows.
  // ::int is needed because COUNT returns a type the driver would otherwise give back as text.
  const result = await pool.query<DashboardStats>(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'open')::int AS open,
       COUNT(*) FILTER (WHERE status = 'in_progress')::int AS "inProgress",
       COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved
     FROM tickets
     WHERE ($1::int IS NULL OR customer_id = $1)`,
    [customerId],
  )
  return result.rows[0]
}
