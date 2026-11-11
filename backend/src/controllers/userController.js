import * as userService from '../services/userService.js'
import { parseRoleFilter } from '../utils/validators.js'

export const listUsers = async (req, res) => {
  const users = await userService.listUsers(parseRoleFilter(req.query.role))
  res.json({ data: users })
}
