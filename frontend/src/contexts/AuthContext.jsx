import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const register = async (email, username, password) => {
    try {
      setError(null)
      setLoading(true)
      const response = await authAPI.register(email, username, password)
      const { access_token, user_id, username: userName, email: userEmail } = response.data
      
      // Save token and user info
      localStorage.setItem('token', access_token)
      const userData = { user_id, username: userName, email: userEmail }
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      
      return { success: true, user: userData }
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      const response = await authAPI.login(email, password)
      const { access_token, user_id, username, email: userEmail } = response.data
      
      // Save token and user info
      localStorage.setItem('token', access_token)
      const userData = { user_id, username, email: userEmail }
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      
      return { success: true, user: userData }
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
