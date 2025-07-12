// eslint-disable-next-line react-hooks/exhaustive-deps
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { parseCookies } from 'nookies'
import { baseUrl } from "../../constant"

interface User {
  id: string
  email: string
  fullName: string
  role: "Teacher" | "Head Teacher" | "Admin" | "Principal"
  permissions?: string[]
}
interface LoginUserData {
  user: User
  accessToken: string
}

interface AuthContextType {
    user: User | null
    login: (userData: LoginUserData) => void
    logout: () => void
    isLoading: boolean
    accesstoken: string | null
    refreshAccessToken: () => Promise<string | null>
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined)
  interface ROLE_PERMISSIONSTYPE {
    Teacher: string[];
    "Head Teacher": string[];
    Admin: string[];
    Principal: string[];
}

  const ROLE_PERMISSIONS: ROLE_PERMISSIONSTYPE = {
    Teacher: ["view_teachers", "view_lessons", "edit_lessons"],
    "Head Teacher": ["view_teachers","add_schedules","edit_schedules","delete_schedules","view_schedules",
      "add_teachers", "edit_teachers", "view_lessons", "edit_lessons", "view_reports"],
    Admin: [
      "view_teachers",
      "add_teachers",
      "edit_teachers",
      "delete_teachers",
      "manage_roles",
      "view_lessons",
      "edit_lessons",
      "view_lessons",
      "view_reports",
      "export_data",
      "view_classes",
      "add_classes",
      "edit_classes",
      "delete_classes",
      "manage_system",
      "create_chapter",
      "view_chapters",
      "edit_chapter",
      "delete_chapter",
      "add_schedules",
      "edit_schedules",
      "delete_schedules",
      "view_schedules",
      ],
    Principal: [
      "create_chapter",
      "create_chapter",
      "view_chapters",
      "delete_chapter",
      "edit_chapter",
      "view_teachers",
      "add_teachers",
      "edit_teachers",
      "delete_teachers",
      "manage_roles",
      "view_lessons",
      "add_lessons",
      "edit_lessons",
      "view_reports",
      "export_data",
      "manage_system",
      "view_classes",
      "add_classes",
      "edit_classes",
      "delete_classes",
      "add_schedules",
      "edit_schedules",
      "delete_schedules",
      "view_schedules",
    ],
  }


  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [accesstoken, setAccessToken] = useState<string | null>(null)
    const router = useRouter()
    console.log("here ")

    const logout = () => {
      setUser(null)
      localStorage.removeItem("user")
      router.push("/login")
    }
    const initializationRef = useRef(false)


// eslint-disable-next-line react-hooks/exhaustive-deps
    const refreshAccessToken = useCallback(async (): Promise<string | null> => {
      try {
        // Get refresh token from cookies
        const cookies = parseCookies()
        const refreshToken = cookies.refreshToken
        
        if (!refreshToken) {
          console.warn("No refresh token available")
          return null
        }
        
        // Call the backend to get a new access token
        const response = await fetch(`${baseUrl}/auth/access-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken , user }) ,
        })
        
        if (!response.ok) {
          throw new Error('Failed to refresh token')
        }
        
        const data = await response.json()
        const newAccessToken = data.data.accessToken
        
        // Update access token in state
        setAccessToken(newAccessToken)
        localStorage.setItem("accessToken", newAccessToken)
        
        // // If we have user data, update it with the new token
        // if (user) {
        //   const updatedUser = { ...user, }
        //   localStorage.setItem("user", JSON.stringify(updatedUser))
        // }
        
        return newAccessToken
      } catch (error) {
        console.error("Error refreshing access token:", error)
        logout()
        return null
      }
    }, [user,logout])

    useEffect(() => {
      if (initializationRef.current) return
      
      const initializeAuth = async () => {
        try {
          initializationRef.current = true
          
          // Check for stored user and token on mount
          const storedUser = typeof window !== 'undefined' ? localStorage.getItem("user") : null
          const storedToken = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null
          
          if (storedUser && storedToken) {
            const userData:User = JSON.parse(storedUser)
            
            // Add null check before accessing role
            if (userData && userData.role && ROLE_PERMISSIONS[userData.role]) {
              setUser({
                ...userData,
                permissions: ROLE_PERMISSIONS[userData.role]
              })
              setAccessToken(storedToken)
            } else {
              // Handle invalid user data
              console.warn("Invalid user data in localStorage")
              localStorage.removeItem("user")
              localStorage.removeItem("accessToken")
            }
          } else {
            // No stored auth data, try to get a new access token with refresh token
            const newToken = await refreshAccessToken()
            if (!newToken) {
              // No valid session, redirect to login
              console.log("No valid session found")
            }
          }
        } catch (error) {
          console.error("Error initializing auth:", error)
          localStorage.removeItem("user")
          localStorage.removeItem("accessToken")
        } finally {
          setIsLoading(false)
        }
      }
      
      initializeAuth()
    }, [refreshAccessToken])
      

    const login = (userData: LoginUserData) => {
      // Add validation before setting user
      const newUserData: User = userData.user
      console.log("Login data received:", userData)
      if (newUserData && newUserData.role && ROLE_PERMISSIONS[newUserData.role]) {
        const userWithPermissions = {
          ...newUserData,
          permissions: ROLE_PERMISSIONS[newUserData.role]
        }
        setUser(userWithPermissions)
        setAccessToken(userData.accessToken)
        
        localStorage.setItem("user", JSON.stringify(userWithPermissions))
        localStorage.setItem("accessToken", userData.accessToken)
      } else {
        console.error("Invalid user data provided to login")
      }
    }
  
    return (
      <AuthContext.Provider
        value={{
          user,
          login,
          logout,
          accesstoken,
          isLoading,
          refreshAccessToken
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
