import { createApiInstance } from './axiosConfig'

const calendarApi = createApiInstance()

export const calendarService = {
  getAllEvents: () => 
    calendarApi.get('/calendar'),
  
  getMyEvents: () => 
    calendarApi.get('/calendar/mine'),
  
  getEventById: (id) => 
    calendarApi.get(`/calendar/${id}`),
  
  createEvent: (eventData) => 
    calendarApi.post('/calendar', eventData),
  
  updateEvent: (id, eventData) => 
    calendarApi.put(`/calendar/${id}`, eventData),
  
  deleteEvent: (id) => 
    calendarApi.delete(`/calendar/${id}`),
}
