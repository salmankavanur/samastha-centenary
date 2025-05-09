"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Eye, Star, StarOff, Calendar, MapPin, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"

interface Event {
  _id: string
  title: string
  description: string
  location: string
  startDate: string
  endDate?: string
  imageUrl?: string
  organizer?: string
  registrationRequired?: boolean
  registrationUrl?: string
  published: boolean
  createdAt: string
  featured: boolean
}

export default function AdminEventsList({ filter = "all" }: { filter?: string }) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchEvents()
  }, [filter])

  async function fetchEvents() {
    setLoading(true)
    try {
      // Build the URL with query parameters
      const params = new URLSearchParams()

      // Add timestamp to prevent caching
      params.append("t", Date.now().toString())

      if (filter === "published") {
        params.append("published", "true")
      } else if (filter === "drafts") {
        params.append("published", "false")
      } else if (filter === "featured") {
        params.append("featured", "true")
      } else if (filter === "upcoming") {
        params.append("upcoming", "true")
      }

      // Append the query string to the URL
      const url = `/api/events?${params.toString()}`

      console.log(`Admin: Fetching events from: ${url} with filter: ${filter}`)

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        console.error("Admin: Error response status:", response.status)
        throw new Error(`Failed to fetch events: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Admin: Received ${data.length} events for filter: ${filter}`, data)

      // Sort events by startDate (chronological order - upcoming first)
      // This is a backup sort in case the API doesn't sort correctly
      const sortedEvents = [...data].sort((a, b) => {
        const dateA = new Date(a.startDate).getTime()
        const dateB = new Date(b.startDate).getTime()
        return dateA - dateB
      })

      setEvents(sortedEvents)
    } catch (error) {
      console.error("Admin: Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/events/${deleteId}`, {
        method: "DELETE",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete event")
      }

      toast({
        title: "Success",
        description: "Event deleted successfully",
      })

      // Remove from local state
      setEvents(events.filter((item) => item._id !== deleteId))

      // Force revalidation
      try {
        await fetch("/api/force-refresh", { method: "GET" })
      } catch (err) {
        console.error("Error revalidating paths:", err)
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  async function toggleFeatured(id: string, featured: boolean) {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        body: JSON.stringify({ featured: !featured }),
      })

      if (!response.ok) {
        throw new Error("Failed to update event")
      }

      toast({
        title: "Success",
        description: `Event ${!featured ? "featured" : "unfeatured"} successfully`,
      })

      // Update local state
      setEvents(events.map((item) => (item._id === id ? { ...item, featured: !featured } : item)))

      // Force revalidation
      try {
        await fetch("/api/force-refresh", { method: "GET" })
      } catch (err) {
        console.error("Error revalidating paths:", err)
      }
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchEvents()
    setTimeout(() => setRefreshing(false), 500)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="premium-card h-96">
            <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-4 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No events found</p>
        <div className="flex justify-center gap-4">
          <Button asChild className="hover:text-white">
            <Link href="/admin/events?action=create">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Link>
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map((item) => (
          <Card key={item._id} className="overflow-hidden">
            {item.imageUrl ? (
              <div className="relative h-48 w-full">
                <img
                  src={`${item.imageUrl}?t=${new Date().getTime()}`}
                  alt={item.title}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="relative h-48 w-full bg-gradient-to-br from-premium-teal to-premium-emerald flex items-center justify-center">
                <span className="text-white text-lg">No image</span>
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold line-clamp-2">{item.title}</h3>
                <div className="flex gap-1">
                  {item.featured && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                    >
                      Featured
                    </Badge>
                  )}
                  <Badge variant={item.published ? "default" : "outline"}>
                    {item.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{item.description}</p>
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {formatDate(new Date(item.startDate))}
                  {item.endDate && ` - ${formatDate(new Date(item.endDate))}`}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/events?action=edit&id=${item._id}`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFeatured(item._id, item.featured)}
                  className="hover:text-white"
                >
                  {item.featured ? (
                    <>
                      <StarOff className="w-4 h-4 mr-1" />
                      Unfeature
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-1" />
                      Feature
                    </>
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${item._id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(item._id)}
                  className="hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
