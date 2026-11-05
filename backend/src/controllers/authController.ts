import type { RequestHandler } from 'express'
import { getCurrentUser } from '../middleware/authenticate'
import * as authService from '../services/authService'

// Controllers translate between HTTP and services: they read the request,
// call a service and send the response. The rules themselves live in services.
//
// There's no try/catch here because Express 5 automatically sends errors from
// async handlers to the error handler.
export const register: RequestHandler = async (req, res) => {
  const result = await authService.register(req.body)
  res.status(201).json({ data: result }) // 201 means "created"
}

export const login: RequestHandler = async (req, res) => {
  const result = await authService.login(req.body)
  res.json({ data: result })
}

export const getMe: RequestHandler = (req, res) => {
  res.json({ data: getCurrentUser(req) })
}
