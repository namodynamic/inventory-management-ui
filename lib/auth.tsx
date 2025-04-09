"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Base API URL - replace with your actual API URL
const API_BASE_URL = "http://localhost:8000/api"

// Types
export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

interface AuthTokens {
  access: string
  refresh: string
}

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

export interface RegisterData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const storedTokens = localStorage.getItem("auth_tokens")

    if (storedTokens) {
      const parsedTokens = JSON.parse(storedTokens) as AuthTokens
      setTokens(parsedTokens)

      // Fetch user profile with the token
      fetchUserProfile(parsedTokens.access)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Fetch user profile
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // If token is invalid, clear storage
        localStorage.removeItem("auth_tokens")
        setTokens(null)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      localStorage.removeItem("auth_tokens")
      setTokens(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true)

    try {
      // Get JWT token
      const tokenResponse = await fetch(`${API_BASE_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        throw new Error(errorData.detail || "Login failed")
      }

      const tokenData = await tokenResponse.json()

      // Save tokens
      localStorage.setItem(
        "auth_tokens",
        JSON.stringify({
          access: tokenData.access,
          refresh: tokenData.refresh,
        }),
      )

      setTokens({
        access: tokenData.access,
        refresh: tokenData.refresh,
      })

      // Fetch user profile
      await fetchUserProfile(tokenData.access)

      // Redirect to dashboard
      router.push("/")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/inventory/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = Object.values(errorData).flat().join(", ")
        throw new Error(errorMessage || "Registration failed")
      }

      // After successful registration, log the user in
      await login(userData.username, userData.password)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    if (tokens?.access) {
      try {
        // Call logout endpoint
        await fetch(`${API_BASE_URL}/inventory/users/logout/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.access}`,
          },
        })
      } catch (error) {
        console.error("Logout error:", error)
      }
    }

    // Clear local storage and state regardless of API response
    localStorage.removeItem("auth_tokens")
    setTokens(null)
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, tokens, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
