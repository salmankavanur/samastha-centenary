"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, User, LogIn, LogOut, Settings, FileText, Home, Calendar, PenSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"

export default function NavBar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isActive = (path: string) => pathname === path

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-gradient-premium backdrop-blur supports-[backdrop-filter]:bg-opacity-80 transition-all duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container flex h-16 items-center px-4 md:px-6">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">SUHBA</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end md:justify-between">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-white/90 ${isActive("/") ? "text-white" : "text-white/80"}`}
            >
              Home
            </Link>
            <Link
              href="/calendar"
              className={`transition-colors hover:text-white/90 ${
                isActive("/calendar") ? "text-white" : "text-white/80"
              }`}
            >
              Calendar
            </Link>

            <Link
              href="/news"
              className={`transition-colors hover:text-white/90 ${
                isActive("/news") ? "text-white" : "text-white/80"
              }`}
            >
              News
            </Link>

            <Link
              href="/events"
              className={`transition-colors hover:text-white/90 ${
                isActive("/events") ? "text-white" : "text-white/80"
              }`}
            >
              Events
            </Link>

            {session && (
              <Link
                href="/contribute"
                className={`transition-colors hover:text-white/90 ${
                  isActive("/contribute") ? "text-white" : "text-white/80"
                }`}
              >
                Contribute
              </Link>
            )}
            {session?.user.role === "admin" && (
              <Link
                href="/admin"
                className={`transition-colors hover:text-white/90 ${
                  pathname.startsWith("/admin") ? "text-white" : "text-white/80"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            <div className="hidden md:block">
              {status === "loading" ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full text-white">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="premium-card w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {session.user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/contribute" className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Contribute</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500 focus:text-white focus:bg-red-500"
                      onSelect={(event) => {
                        event.preventDefault()
                        signOut({ callbackUrl: "/" })
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" className="premium-button">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
            <button
              className="block md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-premium-vertical">
          <div className="container py-4 space-y-4 px-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`flex items-center transition-colors hover:text-white/90 ${
                  isActive("/") ? "text-white" : "text-white/80"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              <Link
                href="/calendar"
                className={`flex items-center transition-colors hover:text-white/90 ${
                  isActive("/calendar") ? "text-white" : "text-white/80"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Link>
              
              {session && (
                <Link
                  href="/contribute"
                  className={`flex items-center transition-colors hover:text-white/90 ${
                    isActive("/contribute") ? "text-white" : "text-white/80"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PenSquare className="w-4 h-4 mr-2" />
                  Contribute
                </Link>
              )}
              {session?.user.role === "admin" && (
                <Link
                  href="/admin"
                  className={`flex items-center transition-colors hover:text-white/90 ${
                    pathname.startsWith("/admin") ? "text-white" : "text-white/80"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              )}
              {session ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center transition-colors hover:text-white/90 text-white/80"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <button
                    className="flex items-center text-left text-white/80 hover:text-white/90"
                    onClick={() => {
                      setIsMenuOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center transition-colors hover:text-white/90 text-white/80"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
