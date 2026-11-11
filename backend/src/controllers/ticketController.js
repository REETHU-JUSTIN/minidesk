import { getCurrentUser } from '../middleware/authenticate.js'
import * as ticketService from '../services/ticketService.js'
import { parseId, parseTicketQuery } from '../utils/validators.js'

export const listTickets = async (req, res) => {
  const tickets = await ticketService.listTickets(getCurrentUser(req), parseTicketQuery(req.query))
  res.json({ data: tickets })
}

export const getTicket = async (req, res) => {
  const ticket = await ticketService.getTicket(getCurrentUser(req), parseId(req.params.id))
  res.json({ data: ticket })
}

export const createTicket = async (req, res) => {
  const ticket = await ticketService.createTicket(getCurrentUser(req), req.body)
  res.status(201).json({ data: ticket })
}

export const updateTicket = async (req, res) => {
  const ticket = await ticketService.updateTicket(getCurrentUser(req), parseId(req.params.id), req.body)
  res.json({ data: ticket })
}

export const deleteTicket = async (req, res) => {
  await ticketService.deleteTicket(getCurrentUser(req), parseId(req.params.id))
  res.status(204).send() // 204 means "done, and there's nothing to send back"
}
