import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, logoutUser, setCredentials, fetchCurrentUser } from '../store/slices/authSlice'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const dispatch = useDispatch()
  const { user, accessToken, refreshToken } = useSelector((state) => state.auth)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const tryRestore = async () => {
      const saved = localStorage.getItem('auth')
      if (saved) {
        try {
          const { user: savedUser, accessToken, refreshToken } = JSON.parse(saved)
          
          // Set credentials in Redux store first
          dispatch(setCredentials({ user: savedUser, accessToken, refreshToken }))
          
          // Validate token by fetching current user
          try {
            await dispatch(fetchCurrentUser()).unwrap()
          } catch (err) {
            // If validation fails, try refresh
            if (refreshToken) {
              try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken }),
                })
                
                if (!response.ok) throw new Error('Refresh failed')
                
                const data = await response.json()
                
                dispatch(setCredentials({
                  user: savedUser,
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                }))
                
                localStorage.setItem('auth', JSON.stringify({
                  user: savedUser,
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                }))
                
                // Try fetching user again
                await dispatch(fetchCurrentUser()).unwrap()
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)
                localStorage.removeItem('auth')
                dispatch(setCredentials({ user: null, accessToken: null, refreshToken: null }))
              }
            } else {
              localStorage.removeItem('auth')
              dispatch(setCredentials({ user: null, accessToken: null, refreshToken: null }))
            }
          }
        } catch (parseError) {
          console.error('Failed to parse auth data:', parseError)
          localStorage.removeItem('auth')
        }
      }
      setIsInitialized(true)
    }
    tryRestore()
  }, [dispatch])

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password })).unwrap()
    return result.user
  }

  const logout = async () => {
    await dispatch(logoutUser())
  }

  const value = useMemo(
    () => ({
      user,
      tokens: { accessToken, refreshToken },
      login,
      logout,
    }),
    [user, accessToken, refreshToken]
  )

  // Show loading until initialization is complete
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
