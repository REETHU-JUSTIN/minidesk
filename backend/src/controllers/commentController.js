import { getCurrentUser } from '../middleware/authenticate.js'
import * as commentService from '../services/commentService.js'
import { parseId } from '../utils/validators.js'

export const listComments = async (req, res) => {
  const comments = await commentService.listComments(getCurrentUser(req), parseId(req.params.id))
  res.json({ data: comments })
}

export const addComment = async (req, res) => {
  const comment = await commentService.addComment(getCurrentUser(req), parseId(req.params.id), req.body.message)
  res.status(201).json({ data: comment })
}
