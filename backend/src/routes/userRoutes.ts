import { Router } from 'express'
import * as userController from '../controllers/userController'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'

export const userRoutes = Router()

userRoutes.get('/', authenticate, authorize('admin'), userController.listUsers)
