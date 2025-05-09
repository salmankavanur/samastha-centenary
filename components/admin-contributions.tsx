"use client"

import { useState, useEffect } from "react"
import { Check, X, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Contribution } from "@/lib/db/models"

interface ContributionWithUser extends Contribution {
  user: {
    _id: string
    name: string
    email: string
    avatarUrl?: string
  }
}

export default function AdminContributions() {
  const { toast } = useToast()
  const [contributions, setContributions] = useState<ContributionWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContribution, setSelectedContribution] = useState<ContributionWithUser | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const [editedSource, setEditedSource] = useState("")
  const [newStatus, setNewStatus] = useState<string>("")
  const [statusNote, setStatusNote] = useState("")

  useEffect(() => {
    fetchContributions()
  }, [])

  const fetchContributions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/contributions")

      if (!response.ok) {
        throw new Error("Failed to fetch contributions")
      }

      const data = await response.json()

      // In a real app, you would fetch user details for each contribution
      // Here we're simulating that the API returns contributions with user data
      const contributionsWithUsers = data.map((contribution: Contribution) => ({
        ...contribution,
        user: {
          _id: contribution.userId,
          name: "Contributor", // This would come from the API in a real app
          email: "contributor@example.com",
          avatarUrl: "/diverse-group-profile.png",
        },
      }))

      setContributions(contributionsWithUsers)
    } catch (error) {
      console.error("Error fetching contributions:", error)
      toast({
        title: "Error",
        description: "Failed to load contributions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/contributions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "approve" }),
      })

      if (!response.ok) {
        throw new Error("Failed to approve contribution")
      }

      // Update local state
      setContributions((prev) =>
        prev.map((contribution) =>
          contribution._id === id
            ? { ...contribution, status: "approved", approvedAt: new Date().toISOString() }
            : contribution,
        ),
      )

      toast({
        title: "Contribution approved",
        description: "The contribution has been approved and will be available for use.",
      })
    } catch (error) {
      console.error("Error approving contribution:", error)
      toast({
        title: "Error",
        description: "Failed to approve contribution",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/contributions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reject" }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject contribution")
      }

      // Update local state
      setContributions((prev) =>
        prev.map((contribution) => (contribution._id === id ? { ...contribution, status: "rejected" } : contribution)),
      )

      toast({
        title: "Contribution rejected",
        description: "The contribution has been rejected.",
      })
    } catch (error) {
      console.error("Error rejecting contribution:", error)
      toast({
        title: "Error",
        description: "Failed to reject contribution",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (contribution: ContributionWithUser) => {
    setSelectedContribution(contribution)
    setEditedContent(contribution.content)
    setEditedSource(contribution.source || "")
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (contribution: ContributionWithUser) => {
    setSelectedContribution(contribution)
    setIsDeleteDialogOpen(true)
  }

  const openStatusDialog = (contribution: ContributionWithUser) => {
    setSelectedContribution(contribution)
    setNewStatus(contribution.status)
    setStatusNote("")
    setIsStatusDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedContribution) return

    try {
      const response = await fetch(`/api/contributions/${selectedContribution._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          content: editedContent,
          source: editedSource,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update contribution")
      }

      // Update local state
      setContributions((prev) =>
        prev.map((contribution) =>
          contribution._id === selectedContribution._id
            ? { ...contribution, content: editedContent, source: editedSource }
            : contribution,
        ),
      )

      toast({
        title: "Contribution updated",
        description: "The contribution has been updated successfully.",
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating contribution:", error)
      toast({
        title: "Error",
        description: "Failed to update contribution",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedContribution) return

    try {
      const response = await fetch(`/api/contributions/${selectedContribution._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete contribution")
      }

      // Update local state
      setContributions((prev) => prev.filter((contribution) => contribution._id !== selectedContribution._id))

      toast({
        title: "Contribution deleted",
        description: "The contribution has been deleted successfully.",
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting contribution:", error)
      toast({
        title: "Error",
        description: "Failed to delete contribution",
        variant: "destructive",
      })
    }
  }

  const handleStatusSubmit = async () => {
    if (!selectedContribution) return

    try {
      const response = await fetch(`/api/contributions/${selectedContribution._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "changeStatus",
          status: newStatus,
          reviewNotes: statusNote,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update contribution status")
      }

      // Update local state
      setContributions((prev) =>
        prev.map((contribution) =>
          contribution._id === selectedContribution._id
            ? { ...contribution, status: newStatus, reviewNotes: statusNote }
            : contribution,
        ),
      )

      toast({
        title: "Status updated",
        description: "The contribution status has been updated successfully.",
      })

      setIsStatusDialogOpen(false)
    } catch (error) {
      console.error("Error updating contribution status:", error)
      toast({
        title: "Error",
        description: "Failed to update contribution status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading contributions...</div>
  }

  const pendingContributions = contributions.filter((c) => c.status === "pending")
  const processedContributions = contributions.filter((c) => c.status !== "pending")

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pending Contributions</h2>

      {pendingContributions.length === 0 ? (
        <p className="text-gray-500">No pending contributions</p>
      ) : (
        <div className="space-y-4">
          {pendingContributions.map((contribution) => (
            <Card key={contribution._id?.toString()}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="mt-1">
                      <AvatarImage
                        src={contribution.user.avatarUrl || "/placeholder.svg"}
                        alt={contribution.user.name}
                      />
                      <AvatarFallback>{contribution.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{contribution.user.name}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(contribution.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="mb-2">{contribution.content}</p>

                      {contribution.source && <p className="text-sm text-gray-500">Source: {contribution.source}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(contribution)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openStatusDialog(contribution)}>
                          <Badge className="mr-2 h-4 px-1" variant="outline">
                            S
                          </Badge>
                          Change Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(contribution)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                      onClick={() => handleApprove(contribution._id!.toString())}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleReject(contribution._id!.toString())}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="text-xl font-semibold mt-8">Processed Contributions</h2>

      {processedContributions.length === 0 ? (
        <p className="text-gray-500">No processed contributions</p>
      ) : (
        <div className="space-y-4">
          {processedContributions.map((contribution) => (
            <Card key={contribution._id?.toString()}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="mt-1">
                      <AvatarImage
                        src={contribution.user.avatarUrl || "/placeholder.svg"}
                        alt={contribution.user.name}
                      />
                      <AvatarFallback>{contribution.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{contribution.user.name}</p>
                        <Badge variant={contribution.status === "approved" ? "default" : "destructive"}>
                          {contribution.status}
                        </Badge>
                      </div>

                      <p className="mb-2">{contribution.content}</p>

                      {contribution.source && <p className="text-sm text-gray-500">Source: {contribution.source}</p>}

                      {contribution.reviewNotes && (
                        <p className="text-sm text-gray-500 mt-2 italic">Note: {contribution.reviewNotes}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(contribution)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openStatusDialog(contribution)}>
                          <Badge className="mr-2 h-4 px-1" variant="outline">
                            S
                          </Badge>
                          Change Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(contribution)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Contribution</DialogTitle>
            <DialogDescription>Make changes to the contribution content.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={5}
                placeholder="Contribution content"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source (optional)</Label>
              <Input
                id="source"
                value={editedSource}
                onChange={(e) => setEditedSource(e.target.value)}
                placeholder="Source of the contribution"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Contribution</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contribution? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Contribution Status</DialogTitle>
            <DialogDescription>Update the status of this contribution.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="disqualified">Disqualified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Review Note (optional)</Label>
              <Textarea
                id="note"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
                placeholder="Add a note about this status change"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusSubmit}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
