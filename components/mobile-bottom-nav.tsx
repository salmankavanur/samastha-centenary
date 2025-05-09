"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Calendar, Newspaper, Bell, User } from "lucide-react"
import { useSession } from "next-auth/react"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => pathname === path

  // Only show on mobile
  if (typeof window !== "undefined" && window.innerWidth >= 768) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/") ? "text-primary" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          href="/calendar"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/calendar") ? "text-primary" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Calendar</span>
        </Link>

        <Link
          href="/news"
          className={`flex flex-col items-center justify-center w-full h-full ${
            pathname.startsWith("/news") ? "text-primary" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Newspaper className="h-5 w-5" />
          <span className="text-xs mt-1">News</span>
        </Link>

        <Link
          href="/events"
          className={`flex flex-col items-center justify-center w-full h-full ${
            pathname.startsWith("/events") ? "text-primary" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Bell className="h-5 w-5" />
          <span className="text-xs mt-1">Events</span>
        </Link>

        <Link
          href={session ? "/profile" : "/login"}
          className={`flex flex-col items-center justify-center w-full h-full ${
            pathname === "/profile" || pathname === "/login" ? "text-primary" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">{session ? "Profile" : "Login"}</span>
        </Link>
      </div>
    </div>
  )
}
