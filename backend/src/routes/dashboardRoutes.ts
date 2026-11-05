import { Router } from 'express'
import * as dashboardController from '../controllers/dashboardController'
import { authenticate } from '../middleware/authenticate'

export const dashboardRoutes = Router()

dashboardRoutes.get('/stats', authenticate, dashboardController.getStats)
