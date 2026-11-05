import type { RequestHandler } from 'express'
import { getCurrentUser } from '../middleware/authenticate'
import * as commentService from '../services/commentService'
import { parseId } from '../utils/validators'

export const listComments: RequestHandler = async (req, res) => {
  const comments = await commentService.listComments(getCurrentUser(req), parseId(req.params.id))
  res.json({ data: comments })
}

export const addComment: RequestHandler = async (req, res) => {
  const comment = await commentService.addComment(getCurrentUser(req), parseId(req.params.id), req.body.message)
  res.status(201).json({ data: comment })
}
