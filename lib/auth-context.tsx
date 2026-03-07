"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  logoutUser as apiLogout,
  getCurrentUser,
  apiFetch,
  getAuthToken,
  setAuthTokens,
  clearAuthTokens,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  APIError,
} from "./api"

interface User {
  id: number
  email: string
  username?: string
  first_name?: string
  last_name?: string
  is_authenticated?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<any>
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    username?: string
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
      const storedUser = getStoredUser<User>()
      if (storedUser) setUser(storedUser)

      if (token) {
        try {
          const userData = await getCurrentUser()
          if (userData?.data) {
            setUser(userData.data)
            setStoredUser(userData.data)
          }
        } catch (error) {
          console.error("[v0] Failed to fetch user", error)
          // Don't clear tokens on refresh for non-auth failures (missing /me endpoint, backend down, etc.)
          const status = (error as any)?.status
          if (status === 401 || status === 403) {
            clearAuthTokens()
            clearStoredUser()
            setUser(null)
          }
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (identifier: string, password: string) => {
    try {
      const data = await apiLogin(identifier, password)
      const user = (data as any).user ?? (data as any).data?.user
      if (user) {
        setUser(user)
      }
      
      // Merge guest cart with user cart
      try {
        await apiFetch("api/carts/merge/", { method: "POST" })
      } catch (mergeError) {
        console.warn("[v0] Cart merge failed:", mergeError)
        // Don't fail login if cart merge fails
      }
      
      return data
    } catch (error) {
      throw error
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    username?: string
  ) => {
    try {
      const response = await apiRegister(email, password, firstName, lastName, username)
      // Do not auto-login after register - account needs activation
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
    isAuthenticated: !!getAuthToken(),
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
