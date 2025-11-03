import { createApiInstance } from './axiosConfig'

const ticketsApi = createApiInstance()

export const ticketsService = {
  getMyTickets: () => 
    ticketsApi.get('/tickets/mine'),
  
  getAllTickets: () => 
    ticketsApi.get('/tickets'),
  
  getTicketById: (id) => 
    ticketsApi.get(`/tickets/${id}`),
  
  createTicket: (ticketData) => 
    ticketsApi.post('/tickets', ticketData),
  
  updateTicket: (id, ticketData) => 
    ticketsApi.put(`/tickets/${id}`, ticketData),
  
  deleteTicket: (id) => 
    ticketsApi.delete(`/tickets/${id}`),
}
