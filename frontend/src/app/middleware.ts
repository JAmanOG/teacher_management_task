import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if user is authenticated by looking for user data in localStorage
  // Note: In a real app, you'd check for a JWT token or session cookie
  const isLoginPage = request.nextUrl.pathname === "/login"

  // Allow access to login page
  if (isLoginPage) {
    return NextResponse.next()
  }

  // For demo purposes, we'll redirect to login if no user cookie is found
  // In a real app, you'd validate a proper authentication token
  const userCookie = request.cookies.get("user")

  if (!userCookie && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
