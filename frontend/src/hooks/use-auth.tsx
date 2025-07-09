"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  email: string
  name: string
  role: "Teacher" | "Head Teacher" | "Admin" | "Principal"
  permissions?: string[]
}

interface AuthContextType {
    user: User | null
    login: (userData: any) => void
    logout: () => void
    isLoading: boolean
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined)
  
  const ROLE_PERMISSIONS = {
    Teacher: ["view_teachers", "view_lessons", "edit_lessons"],
    "Head Teacher": ["view_teachers", "add_teachers", "edit_teachers", "view_lessons", "edit_lessons", "view_reports"],
    Admin: [
      "view_teachers",
      "add_teachers",
      "edit_teachers",
      "delete_teachers",
      "manage_roles",
      "view_lessons",
      "edit_lessons",
      "view_reports",
      "export_data",
    ],
    Principal: [
      "view_teachers",
      "add_teachers",
      "edit_teachers",
      "delete_teachers",
      "manage_roles",
      "view_lessons",
      "edit_lessons",
      "view_reports",
      "export_data",
      "manage_system",
    ],
  }

  interface ROLE_PERMISSIONSTYPE {
        Teacher: string[];
        "Head Teacher": string[];
        Admin: string[];
        Principal: string[];
    }

  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
  
    useEffect(() => {
      // Add proper error handling for localStorage access
      try {
        // Check for stored user on mount
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem("user") : null
        
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          
          // Add null check before accessing role
          if (userData && userData.role && ROLE_PERMISSIONS[userData.role]) {
            setUser({
              ...userData,
              permissions: ROLE_PERMISSIONS[userData.role]
            })
          } else {
            // Handle invalid user data
            console.warn("Invalid user data in localStorage")
            localStorage.removeItem("user")
          }
        }
      } catch (error) {
        console.error("Error retrieving user from localStorage:", error)
        localStorage.removeItem("user") // Remove potentially corrupt data
      } finally {
        setIsLoading(false)
      }
    }, [])
  
    const login = (userData: any) => {
      // Add validation before setting user
      if (userData && userData.role && ROLE_PERMISSIONS[userData.role]) {
        const userWithPermissions = {
          ...userData,
          permissions: ROLE_PERMISSIONS[userData.role]
        }
        setUser(userWithPermissions)
        localStorage.setItem("user", JSON.stringify(userWithPermissions))
      } else {
        console.error("Invalid user data provided to login")
      }
    }
  
    const logout = () => {
      setUser(null)
      localStorage.removeItem("user")
      router.push("/login")
    }
  
    return (
      <AuthContext.Provider
        value={{
          user,
          login,
          logout,
          isLoading
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }
  
  export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
      throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
  }
