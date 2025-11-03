import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
})

let tokens = { accessToken: null, refreshToken: null }

instance.interceptors.request.use((config) => {
  // First try to get token from the tokens object (for backward compatibility)
  let accessToken = tokens.accessToken
  
  // If not available, try to get from localStorage
  if (!accessToken) {
    const authData = localStorage.getItem('auth')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        accessToken = parsed.accessToken
      } catch (e) {
        console.error('Failed to parse auth data:', e)
      }
    }
  }
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  
  return config
})

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    
    // Get refresh token from tokens object or localStorage
    let refreshToken = tokens.refreshToken
    if (!refreshToken) {
      const authData = localStorage.getItem('auth')
      if (authData) {
        try {
          const parsed = JSON.parse(authData)
          refreshToken = parsed.refreshToken
        } catch (e) {
          console.error('Failed to parse auth data:', e)
        }
      }
    }
    
    if (error.response?.status === 401 && !original._retry && refreshToken) {
      original._retry = true
      try {
        const { data } = await instance.post('/auth/refresh', { refreshToken })
        tokens.accessToken = data.accessToken
        tokens.refreshToken = data.refreshToken
        
        // Update localStorage
        const currentAuth = JSON.parse(localStorage.getItem('auth') || '{}')
        const updatedAuth = {
          ...currentAuth,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }
        localStorage.setItem('auth', JSON.stringify(updatedAuth))
        
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return instance(original)
      } catch (e) {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem('auth')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const api = {
  get: (...args) => instance.get(...args),
  post: (...args) => instance.post(...args),
  put: (...args) => instance.put(...args),
  patch: (...args) => instance.patch(...args),
  delete: (...args) => instance.delete(...args),
  setTokens: (t) => { tokens = { ...tokens, ...t } },
}
