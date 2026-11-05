import type { RequestHandler } from 'express'
import { getCurrentUser } from '../middleware/authenticate'
import * as dashboardService from '../services/dashboardService'

export const getStats: RequestHandler = async (req, res) => {
  const stats = await dashboardService.getDashboardStats(getCurrentUser(req))
  res.json({ data: stats })
}
