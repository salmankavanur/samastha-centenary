import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next()

  // Add cache control headers to prevent caching at all levels
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")
  response.headers.set("Surrogate-Control", "no-store")

  // Get the pathname
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/setup",
    "/calendar",
    "/events",
    "/news",
    "/api/init",
    "/api/test-db",
    "/api/debug-db",
    "/api/init-db",
    "/api/register",
    "/api/test-supabase",
    "/api/news",
    "/api/events",
  ]

  // Check if the path starts with any of these
  const isPublicPathStart = [
    "/status/",
    "/api/status",
    "/_next",
    "/favicon.ico",
    "/manifest.webmanifest",
    "/images/",
    "/icons/",
    "/news/",
    "/events/",
    "/api/news/",
    "/api/events/",
  ]

  // Admin paths that require admin role
  const adminPaths = ["/admin"]

  // Check if the path is public
  const isPublic = publicPaths.includes(pathname) || isPublicPathStart.some((path) => pathname.startsWith(path))

  if (isPublic) {
    return response
  }

  // Get the token
  const token = await getToken({ req: request })

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Check if user is admin
  const isAdmin = token.role === "admin" || token.role === "superadmin"

  // If not admin and trying to access admin paths
  if (!isAdmin && adminPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return response
}

// Apply this middleware to all routes
export const config = {
  matcher: ["/((?!api/auth|api/users|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|webp)).*)"],
}
