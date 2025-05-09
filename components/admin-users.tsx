"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Search, Filter } from "lucide-react"
import type { User } from "@/lib/db/models"

export default function AdminUsers() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "contributor" as "admin" | "contributor",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBadgeChange = async (userId: string, newBadge: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ badge: newBadge }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user badge")
      }

      // Update local state
      setUsers((prev) => prev.map((user) => (user._id === userId ? { ...user, badge: newBadge || null } : user)))

      toast({
        title: "Badge updated",
        description: "The user's badge has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating user badge:", error)
      toast({
        title: "Error",
        description: "Failed to update user badge",
        variant: "destructive",
      })
    }
  }

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to approve user")
      }

      // Update local state
      setUsers((prev) => prev.map((user) => (user._id === userId ? { ...user, isApproved: true } : user)))

      toast({
        title: "User approved",
        description: "The user has been approved and can now contribute content.",
      })
    } catch (error) {
      console.error("Error approving user:", error)
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      })
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to create user")
      }

      // Reset form and close dialog
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "contributor",
      })
      setAddUserOpen(false)

      // Refresh user list
      fetchUsers()

      toast({
        title: "User created",
        description: `${newUser.name} has been added as a ${newUser.role}.`,
      })
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>
  }

  // Separate users into categories
  const superAdmins = filteredUsers.filter((user) => user.role === "admin" && user.email === "admin@example.com")
  const adminUsers = filteredUsers.filter((user) => user.role === "admin" && user.email !== "admin@example.com")
  const pendingUsers = filteredUsers.filter((user) => !user.isApproved && user.role === "contributor")
  const approvedUsers = filteredUsers.filter((user) => user.isApproved && user.role === "contributor")

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Manage Users</h2>
          <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account. All fields are required.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>User Role</Label>
                    <RadioGroup
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value as "admin" | "contributor" })}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin">Admin</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="contributor" id="contributor" />
                        <Label htmlFor="contributor">Contributor</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create User</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSearchTerm("")}>All Users</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm("admin")}>Admins Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm("contributor")}>Contributors Only</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Super Admin Section */}
      {superAdmins.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Super Admin</h3>
          {superAdmins.map((user) => (
            <Card key={user._id?.toString()} className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        <Badge variant="default">Super Admin</Badge>
                      </div>

                      <p className="text-sm text-gray-500">{user.email}</p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Joined: {new Date(user.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Admin Users Section */}
      {adminUsers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Admin Users ({adminUsers.length})</h3>
          {adminUsers.map((user) => (
            <Card key={user._id?.toString()} className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        <Badge variant="secondary">Admin</Badge>
                      </div>

                      <p className="text-sm text-gray-500">{user.email}</p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Joined: {new Date(user.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Users Section */}
      {pendingUsers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pending Approval ({pendingUsers.length})</h3>
          {pendingUsers.map((user) => (
            <Card key={user._id?.toString()} className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          Pending Approval
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-500">{user.email}</p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Joined: {new Date(user.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApproveUser(user._id!.toString())}>
                      Approve User
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Active Contributors Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Active Contributors ({approvedUsers.length})</h3>
        {approvedUsers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">No active contributors found.</CardContent>
          </Card>
        ) : (
          approvedUsers.map((user) => (
            <Card key={user._id?.toString()}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        <Badge variant="outline">Contributor</Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Approved
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-500">{user.email}</p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Joined: {new Date(user.joinedAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">Contributions: {user.contributionsCount}</span>
                        {user.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {user.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Manage Badge
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleBadgeChange(user._id!.toString(), "Rising Contributor")}>
                          Rising Contributor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBadgeChange(user._id!.toString(), "Top Contributor")}>
                          Top Contributor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBadgeChange(user._id!.toString(), "Verified Scholar")}>
                          Verified Scholar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBadgeChange(user._id!.toString(), "")}>
                          Remove Badge
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
