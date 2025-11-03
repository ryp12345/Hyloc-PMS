import { createApiInstance } from './axiosConfig'

const authApi = createApiInstance()

export const authService = {
  login: (email, password) => 
    authApi.post('/auth/login', { email, password }),
  
  logout: () => 
    authApi.post('/auth/logout'),
  
  refresh: (refreshToken) => 
    authApi.post('/auth/refresh', { refreshToken }),
  
  getMe: () => 
    authApi.get('/auth/me'),
}
