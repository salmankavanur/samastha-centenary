import type { ReactNode } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Home, Upload, MessageSquare, Users, Settings, FileText, LogOut, Newspaper, Calendar, Menu } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Check authentication server-side
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/login?callbackUrl=/admin")
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b bg-background">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6 flex items-center justify-between">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <ThemeToggle />
            </div>
            <div className="px-4 py-2">
              <p className="text-sm text-muted-foreground mb-4">Welcome, {session.user.name}</p>
            </div>
            <nav className="px-4 py-2">
              <ul className="space-y-1">
                <li>
                  <Link href="/admin" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/admin/posts" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                    <FileText className="w-4 h-4 mr-2" />
                    Manage Posts
                  </Link>
                </li>
                <li>
                  <Link href="/admin/news" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                    <Newspaper className="w-4 h-4 mr-2" />
                    Manage News
                  </Link>
                </li>
                <li>
                  <Link href="/admin/events" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/uploads"
                    className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Status
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/contributions"
                    className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contributions
                  </Link>
                </li>
                <li>
                  <Link href="/admin/users" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/settings"
                    className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </li>
                <li>
                  <Link href="/admin/debug" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                    <Settings className="w-4 h-4 mr-2" />
                    Date Debug
                  </Link>
                </li>
              </ul>

              <div className="pt-4 mt-4 border-t border-border">
                <form action="/api/auth/signout" method="post">
                  <Button
                    variant="ghost"
                    className="flex w-full items-center px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 hover:text-white"
                    type="submit"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </form>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <ThemeToggle />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 border-r border-border">
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <ThemeToggle />
        </div>
        <div className="px-4 py-2">
          <p className="text-sm text-muted-foreground mb-4">Welcome, {session.user.name}</p>
        </div>
        <nav className="px-4 py-2">
          <ul className="space-y-1">
            <li>
              <Link href="/admin" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/posts" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                <FileText className="w-4 h-4 mr-2" />
                Manage Posts
              </Link>
            </li>
            <li>
              <Link href="/admin/news" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                <Newspaper className="w-4 h-4 mr-2" />
                Manage News
              </Link>
            </li>
            <li>
              <Link href="/admin/events" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Events
              </Link>
            </li>
            <li>
              <Link href="/admin/uploads" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                <Upload className="w-4 h-4 mr-2" />
                Upload Status
              </Link>
            </li>
            <li>
              <Link
                href="/admin/contributions"
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contributions
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                <Users className="w-4 h-4 mr-2" />
                Users
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </li>
            <li>
              <Link href="/admin/debug" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                <Settings className="w-4 h-4 mr-2" />
                Date Debug
              </Link>
            </li>
          </ul>

          <div className="pt-4 mt-4 border-t border-border">
            <form action="/api/auth/signout" method="post">
              <Button
                variant="ghost"
                className="flex w-full items-center px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 hover:text-white"
                type="submit"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="lg:container px-4 py-8 lg:px-6 lg:py-8 mx-auto mt-16 lg:mt-0">{children}</div>
      </div>
    </div>
  )
}
