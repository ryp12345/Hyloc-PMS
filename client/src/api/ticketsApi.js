import { createApiInstance } from './axiosConfig'

const ticketsApi = createApiInstance()

export const ticketsService = {
  // Get tickets with filters
  getTickets: (params = {}) => 
    ticketsApi.get('/tickets', { params }),
  
  // Get tickets by scope
  getMyTickets: () => 
    ticketsApi.get('/tickets?scope=created'),
  
  getAssignedTickets: () => 
    ticketsApi.get('/tickets?scope=assigned'),
  
  getResponsibleTickets: () => 
    ticketsApi.get('/tickets?scope=responsible'),
  
  getAllTickets: () => 
    ticketsApi.get('/tickets?scope=all'),
  
  // Get single ticket
  getTicketById: (id) => 
    ticketsApi.get(`/tickets/${id}`),
  
  // Create ticket
  createTicket: (ticketData) => 
    ticketsApi.post('/tickets', ticketData),
  
  // Assign ticket to responsible person
  assignTicket: (id, assignmentData) => 
    ticketsApi.patch(`/tickets/${id}/assign`, assignmentData),
  
  // Update ticket status
  updateTicketStatus: (id, statusData) => 
    ticketsApi.patch(`/tickets/${id}/status`, statusData),
  
  // Delete ticket
  deleteTicket: (id) => 
    ticketsApi.delete(`/tickets/${id}`),
}
