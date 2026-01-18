"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Loader2 } from "lucide-react"

interface RouteGuardProps {
  allowedRoles: string[]
  children: React.ReactNode
  redirectTo?: string
}

// Routes that don't require authentication
const publicRoutes = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/waiter/login",
  "/kitchen/login",
  "/guest/login",
  "/guest/register",
  "/guest/forgot-password",
  "/guest/reset-password",
  "/guest/verify-email",
]

/**
 * RouteGuard - Protects routes based on user roles
 * 
 * Role access matrix:
 * - admin: can access admin, waiter, kitchen (but NOT guest)
 * - waiter: can only access waiter pages
 * - kitchen: can only access kitchen pages  
 * - guest: can only access guest pages
 * - public: menu pages accessible to all
 */
export function RouteGuard({ allowedRoles, children, redirectTo }: RouteGuardProps) {
  const { role, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Check if current path is a public route that doesn't need auth
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    if (loading) return

    // Allow access to public routes (login, register, etc.) without authentication
    if (isPublicRoute) {
      return
    }

    // If not authenticated and page requires auth
    if (!isAuthenticated && !allowedRoles.includes("public")) {
      // Redirect to appropriate login page based on current path
      if (pathname.startsWith("/admin")) {
        router.replace("/admin/login")
      } else if (pathname.startsWith("/waiter")) {
        router.replace("/waiter/login")
      } else if (pathname.startsWith("/kitchen")) {
        router.replace("/kitchen")
      } else if (pathname.startsWith("/guest")) {
        router.replace("/guest/login")
      }
      return
    }

    // If authenticated, check role permissions
    if (isAuthenticated && role) {
      // Admin special case: can access waiter and kitchen but NOT guest
      if (role === "admin") {
        if (pathname.startsWith("/guest") && !isPublicRoute) {
          router.replace(redirectTo || "/admin/dashboard")
          return
        }
        // Admin can access admin, waiter, kitchen - allowed
        return
      }

      // Waiter: can only access waiter pages
      if (role === "waiter") {
        if (!pathname.startsWith("/waiter") && !pathname.startsWith("/menu")) {
          router.replace(redirectTo || "/waiter")
          return
        }
      }

      // Kitchen: can only access kitchen pages
      if (role === "kitchen") {
        if (!pathname.startsWith("/kitchen") && !pathname.startsWith("/menu")) {
          router.replace(redirectTo || "/kitchen")
          return
        }
      }

      // Guest: can only access guest and menu pages
      if (role === "guest") {
        if (pathname.startsWith("/admin") || pathname.startsWith("/waiter") || pathname.startsWith("/kitchen")) {
          router.replace(redirectTo || "/menu/guest")
          return
        }
      }

      // Check if user's role is in allowed roles
      // Note: Admin already returned above if accessing admin/waiter/kitchen paths
      // This check is for waiter/kitchen/guest accessing wrong pages
      const hasAccess = allowedRoles.includes(role) || allowedRoles.includes("public")
      if (!hasAccess) {
        // Redirect based on role
        if (role === "waiter") {
          router.replace("/waiter")
        } else if (role === "kitchen") {
          router.replace("/kitchen")
        } else if (role === "guest") {
          router.replace("/menu/guest")
        }
      }
    }
  }, [role, loading, isAuthenticated, pathname, router, redirectTo, allowedRoles, isPublicRoute])

  // Allow public routes without loading spinner
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If requires auth and not authenticated, don't render children
  if (!isAuthenticated && !allowedRoles.includes("public")) {
    return null
  }

  return <>{children}</>
}

