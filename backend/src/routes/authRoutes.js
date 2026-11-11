import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { loginLimiter, registerLimiter } from '../middleware/rateLimits.js'
import { validateBody } from '../middleware/validate.js'
import { validateLogin, validateRegister } from '../utils/validators.js'

export const authRoutes = Router()

// Each function runs in order, and any of them can stop the request by sending an error.
authRoutes.post('/register', registerLimiter, validateBody(validateRegister), authController.register)
authRoutes.post('/login', loginLimiter, validateBody(validateLogin), authController.login)
authRoutes.get('/me', authenticate, authController.getMe)
