import type { DashboardStats, PublicUser, TicketStatus } from '../types'
import { store } from './devStore'

// In Phase 6, a SQL aggregation query does this.
export async function getDashboardStats(user: PublicUser): Promise<DashboardStats> {
  // Customers only count their own tickets.
  const tickets = user.role === 'customer' ? store.tickets.filter((ticket) => ticket.customerId === user.id) : store.tickets
  const countByStatus = (status: TicketStatus) => tickets.filter((ticket) => ticket.status === status).length

  return {
    total: tickets.length,
    open: countByStatus('open'),
    inProgress: countByStatus('in_progress'),
    resolved: countByStatus('resolved'),
  }
}
