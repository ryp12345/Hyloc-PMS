// DUPLICATE_LEAVE_CALENDAR_DISABLED: 2025-11-15 — Disabled duplicate leave management (Calendar API)
// The Calendar API client is deprecated and intentionally disabled.
// Original implementation has been commented out to avoid accidental use.
/*
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
*/

export const calendarService = {}
