import { createApiInstance } from './axiosConfig'

const leavesApi = createApiInstance()

export const leavesService = {
  getMyLeaves: () => 
    leavesApi.get('/leaves/mine'),
  
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
  
  rejectLeave: (id) => 
    leavesApi.post(`/leaves/${id}/reject`),
  
  deleteLeave: (id) => 
    leavesApi.delete(`/leaves/${id}`),
}
