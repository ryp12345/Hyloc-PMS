import { createApiInstance } from './axiosConfig'

const leavesApi = createApiInstance()

export const leavesService = {
  getMyLeaves: () => 
    leavesApi.get('/leaves/mine'),
  
  getLeaveBalance: () => 
    leavesApi.get('/leaves/balance'),
  
  getAllLeaves: () => 
    leavesApi.get('/leaves'),
  
  getPendingLeaves: () => 
    leavesApi.get('/leaves/pending'),
  
  getLeaveById: (id) => 
    leavesApi.get(`/leaves/${id}`),
  
  applyLeave: (leaveData) => 
    leavesApi.post('/leaves', leaveData),
  
  updateLeave: (id, leaveData) => 
    leavesApi.put(`/leaves/${id}`, leaveData),
  
  approveLeave: (id) => 
    leavesApi.post(`/leaves/${id}/approve`),
  
  rejectLeave: (id, data) => 
    leavesApi.post(`/leaves/${id}/reject`, data),
  
  deleteLeave: (id) => 
    leavesApi.delete(`/leaves/${id}`),

  // User leave history by year (self or HR/Management)
  getUserLeaveHistory: (userId, year) => 
    leavesApi.get(`/users/${userId}/leave-history`, { params: { year } }),
}
