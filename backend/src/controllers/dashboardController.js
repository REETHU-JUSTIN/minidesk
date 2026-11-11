import { getCurrentUser } from '../middleware/authenticate.js'
import * as dashboardService from '../services/dashboardService.js'

export const getStats = async (req, res) => {
  const stats = await dashboardService.getDashboardStats(getCurrentUser(req))
  res.json({ data: stats })
}
