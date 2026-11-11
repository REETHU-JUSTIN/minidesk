import { Types } from 'mongoose'
import { Ticket } from '../models/Ticket.js'

// $cond adds 1 for tickets with this status, and 0 for the rest.
const countStatus = (status) => ({ $sum: { $cond: [{ $eq: ['$status', status] }, 1, 0] } })

export async function getDashboardStats(user) {
  // Unlike normal queries, aggregation doesn't convert text to ObjectIds automatically.
  // Customers only count their own tickets.
  const match = user.role === 'customer' ? { customer: new Types.ObjectId(user.id) } : {}

  // One pipeline calculates all four numbers. _id: null puts every ticket in a single group.
  const [stats] = await Ticket.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        open: countStatus('open'),
        inProgress: countStatus('in_progress'),
        resolved: countStatus('resolved'),
      },
    },
    { $project: { _id: 0 } },
  ])

  // With no tickets, there are no groups, so the pipeline returns nothing.
  return stats ?? { total: 0, open: 0, inProgress: 0, resolved: 0 }
}
