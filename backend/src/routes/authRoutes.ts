import { Router } from 'express'
import * as authController from '../controllers/authController'
import { authenticate } from '../middleware/authenticate'
import { validateBody } from '../middleware/validate'
import { validateLogin, validateRegister } from '../utils/validators'

export const authRoutes = Router()

// Each function runs in order, and any of them can stop the request by sending an error.
authRoutes.post('/register', validateBody(validateRegister), authController.register)
authRoutes.post('/login', validateBody(validateLogin), authController.login)
authRoutes.get('/me', authenticate, authController.getMe)
