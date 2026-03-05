"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  logoutUser as apiLogout,
  getCurrentUser,
  getAuthToken,
  setAuthTokens,
  clearAuthTokens,
} from "./api"

interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  is_authenticated?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<any>
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<any>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken()
      if (token) {
        try {
          const userData = await getCurrentUser()
          if (userData?.data) {
            setUser(userData.data)
          }
        } catch (error) {
          console.error("[v0] Failed to fetch user", error)
          clearAuthTokens()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password)
      if (response.data?.user) {
        setUser(response.data.user)
      }
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      const response = await apiRegister(email, password, firstName, lastName)
      // Auto-login after register
      if (response.data?.access) {
        setAuthTokens(response.data.access, response.data.refresh)
        if (response.data?.user) {
          setUser(response.data.user)
        }
      }
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } finally {
      setUser(null)
    }
  }

  const refreshUser = async () => {
    const token = getAuthToken()
    if (token) {
      try {
        const userData = await getCurrentUser()
        if (userData?.data) {
          setUser(userData.data)
        }
      } catch (error) {
        console.error("[v0] Failed to refresh user", error)
      }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
