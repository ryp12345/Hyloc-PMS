import { createApiInstance } from './axiosConfig'

const usersApi = createApiInstance()

export const usersService = {
  getAllUsers: () => 
    usersApi.get('/users'),
  
  getStaffNames: () => 
    usersApi.get('/users/staff-names'),
  
  getUserById: (id) => 
    usersApi.get(`/users/${id}`),
  
  createUser: (userData) => 
    usersApi.post('/users', userData),
  
  updateUser: (id, userData) => 
    usersApi.put(`/users/${id}`, userData),
  
  deleteUser: (id) => 
    usersApi.delete(`/users/${id}`),
  assignRole: (id, data) =>
    usersApi.post(`/users/${id}/assign-role`, data),
  getUserRoles: (id) =>
    usersApi.get(`/users/${id}/roles`),
  getRoleAssignments: () =>
    usersApi.get('/users/role-assignments'),
  updateAssignment: (userId, assignmentId, data) =>
    usersApi.put(`/users/${userId}/roles/${assignmentId}`, data),
  deleteAssignment: (userId, assignmentId) =>
    usersApi.delete(`/users/${userId}/roles/${assignmentId}`),
}
