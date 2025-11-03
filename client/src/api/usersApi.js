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
}
