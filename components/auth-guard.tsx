"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth"

// List of public routes that don't require authentication
const publicRoutes = ["/login", "/register"]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip if still loading auth state
    if (isLoading) return

    // If user is not authenticated and trying to access a protected route
    if (!user && !publicRoutes.includes(pathname)) {
      router.push("/login")
    }

    // If user is authenticated and trying to access login/register
    if (user && publicRoutes.includes(pathname)) {
      router.push("/")
    }
  }, [user, isLoading, router, pathname])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  // If on a public route or authenticated, render children
  if (publicRoutes.includes(pathname) || user) {
    return <>{children}</>
  }

  // This should not be visible as the useEffect should redirect
  return null
}
