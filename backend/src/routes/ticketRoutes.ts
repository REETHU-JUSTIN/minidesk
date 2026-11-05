import { Router } from 'express'
import * as commentController from '../controllers/commentController'
import * as ticketController from '../controllers/ticketController'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { validateBody } from '../middleware/validate'
import { validateComment, validateCreateTicket, validateUpdateTicket } from '../utils/validators'

export const ticketRoutes = Router()

// Applies to every route below, so none of them can forget to require a login.
ticketRoutes.use(authenticate)

ticketRoutes.get('/', ticketController.listTickets)
ticketRoutes.post('/', authorize('customer'), validateBody(validateCreateTicket), ticketController.createTicket)
ticketRoutes.get('/:id', ticketController.getTicket)
ticketRoutes.put('/:id', validateBody(validateUpdateTicket), ticketController.updateTicket)
ticketRoutes.delete('/:id', authorize('admin'), ticketController.deleteTicket)

ticketRoutes.get('/:id/comments', commentController.listComments)
ticketRoutes.post('/:id/comments', validateBody(validateComment), commentController.addComment)
