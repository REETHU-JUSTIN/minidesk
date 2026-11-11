import { api } from './api'

// An AbortSignal lets the caller cancel the HTTP request if it's no longer needed.

export async function getTickets(query, signal) {
  const response = await api.get('/tickets', { params: query, signal })
  return response.data.data
}

export async function getTicketById(ticketId, signal) {
  const response = await api.get(`/tickets/${ticketId}`, { signal })
  return response.data.data
}

export async function createTicket(input) {
  const response = await api.post('/tickets', input)
  return response.data.data
}

export async function updateTicket(ticketId, changes) {
  const response = await api.put(`/tickets/${ticketId}`, changes)
  return response.data.data
}

export async function deleteTicket(ticketId) {
  await api.delete(`/tickets/${ticketId}`)
}

export async function getComments(ticketId) {
  const response = await api.get(`/tickets/${ticketId}/comments`)
  return response.data.data
}

export async function postComment(ticketId, message) {
  const response = await api.post(`/tickets/${ticketId}/comments`, { message })
  return response.data.data
}

export async function getDashboardStats(signal) {
  const response = await api.get('/dashboard/stats', { signal })
  return response.data.data
}
