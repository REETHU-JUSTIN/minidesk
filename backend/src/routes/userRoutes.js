import { Router } from 'express'
import * as userController from '../controllers/userController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'

export const userRoutes = Router()

userRoutes.get('/', authenticate, authorize('admin'), userController.listUsers)
