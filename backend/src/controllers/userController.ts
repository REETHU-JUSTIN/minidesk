import type { RequestHandler } from 'express'
import * as userService from '../services/userService'
import { parseRoleFilter } from '../utils/validators'

export const listUsers: RequestHandler = async (req, res) => {
  const users = await userService.listUsers(parseRoleFilter(req.query.role))
  res.json({ data: users })
}
