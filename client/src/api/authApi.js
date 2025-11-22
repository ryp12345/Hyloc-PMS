import { createApiInstance } from './axiosConfig'

const authApi = createApiInstance()

export const authService = {
  login: (email, password, selectedRole) => {
    const payload = { email, password }
    if (selectedRole) {
      payload.selectedRole = selectedRole
    }
    return authApi.post('/auth/login', payload)
  },
  
  logout: () => 
    authApi.post('/auth/logout'),
  
  refresh: (refreshToken) => 
    authApi.post('/auth/refresh', { refreshToken }),
  
  getMe: () => 
    authApi.get('/auth/me'),
  
  changePassword: (currentPassword, newPassword) => 
    authApi.post('/auth/change-password', { currentPassword, newPassword }),
  
  switchRole: (roleId) =>
    authApi.post('/auth/switch-role', { roleId }),
}
