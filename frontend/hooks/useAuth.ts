"use client"

import { useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"

interface User {
  userId: string
  email: string
  role: string
  full_name?: string
}

interface DecodedToken {
  userId: string
  email: string
  role: string
  exp: number
}

interface AuthState {
  user: User | null
  role: string | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const checkAuth = () => {
      // Check all possible tokens
      const adminToken = localStorage.getItem("admin_token")
      const waiterToken = localStorage.getItem("waiterToken")
      const kitchenToken = localStorage.getItem("kitchenToken")
      const customerToken = localStorage.getItem("customerToken")

      // Priority: admin > waiter > kitchen > customer
      const token = adminToken || waiterToken || kitchenToken || customerToken

      if (!token) {
        setState({
          user: null,
          role: null,
          loading: false,
          isAuthenticated: false,
        })
        return
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token)
        
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          // Token expired, clear it
          localStorage.removeItem("admin_token")
          localStorage.removeItem("waiterToken")
          localStorage.removeItem("kitchenToken")
          localStorage.removeItem("customerToken")
          
          setState({
            user: null,
            role: null,
            loading: false,
            isAuthenticated: false,
          })
          return
        }

        setState({
          user: {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
          },
          role: decoded.role,
          loading: false,
          isAuthenticated: true,
        })
      } catch {
        setState({
          user: null,
          role: null,
          loading: false,
          isAuthenticated: false,
        })
      }
    }

    checkAuth()
  }, [])

  return state
}
