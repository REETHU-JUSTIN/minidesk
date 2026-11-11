import type {
  ApiResponse,
  CreateTicketInput,
  DashboardStats,
  PaginatedResponse,
  Ticket,
  TicketComment,
  TicketQuery,
  UpdateTicketInput,
} from '../types'
import { api } from './api'

// An AbortSignal lets the caller cancel the HTTP request if it's no longer needed.

export async function getTickets(query: TicketQuery, signal?: AbortSignal): Promise<PaginatedResponse<Ticket>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Ticket>>>('/tickets', { params: query, signal })
  return response.data.data
}

export async function getTicketById(ticketId: string, signal?: AbortSignal): Promise<Ticket> {
  const response = await api.get<ApiResponse<Ticket>>(`/tickets/${ticketId}`, { signal })
  return response.data.data
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const response = await api.post<ApiResponse<Ticket>>('/tickets', input)
  return response.data.data
}

export async function updateTicket(ticketId: string, changes: UpdateTicketInput): Promise<Ticket> {
  const response = await api.put<ApiResponse<Ticket>>(`/tickets/${ticketId}`, changes)
  return response.data.data
}

export async function deleteTicket(ticketId: string): Promise<void> {
  await api.delete(`/tickets/${ticketId}`)
}

export async function getComments(ticketId: string): Promise<TicketComment[]> {
  const response = await api.get<ApiResponse<TicketComment[]>>(`/tickets/${ticketId}/comments`)
  return response.data.data
}

export async function postComment(ticketId: string, message: string): Promise<TicketComment> {
  const response = await api.post<ApiResponse<TicketComment>>(`/tickets/${ticketId}/comments`, { message })
  return response.data.data
}

export async function getDashboardStats(signal?: AbortSignal): Promise<DashboardStats> {
  const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats', { signal })
  return response.data.data
}
