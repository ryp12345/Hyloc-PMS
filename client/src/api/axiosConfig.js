import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Create a base axios instance with common configuration
export const createApiInstance = (baseURL = BASE_URL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const authData = localStorage.getItem('auth')
      if (authData) {
        const { accessToken } = JSON.parse(authData)
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor for token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const authData = localStorage.getItem('auth')
          if (authData) {
            const { refreshToken } = JSON.parse(authData)
            
            if (refreshToken) {
              const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
              
              // Update tokens in localStorage
              const currentAuth = JSON.parse(localStorage.getItem('auth'))
              const updatedAuth = {
                ...currentAuth,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
              }
              localStorage.setItem('auth', JSON.stringify(updatedAuth))

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
              return instance(originalRequest)
            }
          }
        } catch (refreshError) {
          // If refresh fails, clear auth and redirect to login
          localStorage.removeItem('auth')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )

  return instance
}
