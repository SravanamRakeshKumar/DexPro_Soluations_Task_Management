import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authService.verifyToken(token)
        .then(userData => {
          setUser({ ...userData, token });
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  // const login = async (email, password) => {


  const login = async (email, password) => {
  try {
    const response = await authService.login(email, password);
    const userWithToken = {
      ...response.user,
      token: response.token, // ✅ include token here
    };
    localStorage.setItem('token', response.token);
    setUser(userWithToken); // ✅ set full user object
    return response;
  } catch (error) {
    throw error;
  }
};


  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}