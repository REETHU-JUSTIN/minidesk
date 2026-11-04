import type { CreateTicketInput, DashboardStats, PaginatedResponse, Ticket, TicketComment, TicketQuery, UpdateTicketInput } from '../types'
import { addComment, addTicket, changeTicket, getTicket, listComments, listTickets, loadDashboardStats, removeTicket } from './previewBackend'

export function getTickets(query: TicketQuery): Promise<PaginatedResponse<Ticket>> {
  return listTickets(query)
}

export function getTicketById(ticketId: number): Promise<Ticket> {
  return getTicket(ticketId)
}

export function createTicket(input: CreateTicketInput): Promise<Ticket> {
  return addTicket(input)
}

export function updateTicket(ticketId: number, changes: UpdateTicketInput): Promise<Ticket> {
  return changeTicket(ticketId, changes)
}

export function deleteTicket(ticketId: number): Promise<void> {
  return removeTicket(ticketId)
}

export function getComments(ticketId: number): Promise<TicketComment[]> {
  return listComments(ticketId)
}

export function postComment(ticketId: number, message: string): Promise<TicketComment> {
  return addComment(ticketId, message)
}

export function getDashboardStats(): Promise<DashboardStats> {
  return loadDashboardStats()
}
