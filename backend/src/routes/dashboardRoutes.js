import { Router } from 'express'
import * as dashboardController from '../controllers/dashboardController.js'
import { authenticate } from '../middleware/authenticate.js'

export const dashboardRoutes = Router()

dashboardRoutes.get('/stats', authenticate, dashboardController.getStats)
