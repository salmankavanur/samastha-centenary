"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface Event {
  _id: string
  title: string
  description: string
  location: string
  startDate: string
  endDate?: string
  imageUrl?: string
  featured: boolean
  published: boolean
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const timestamp = new Date().getTime()

      // Get all published events without any filtering
      const url = `/api/events?t=${timestamp}&published=true&limit=10`
      console.log("Upcoming Events: Fetching from URL:", url)

      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`)
      }

      const data = await response.json()
      console.log("Upcoming Events: Received data:", data)

      // Sort events by date (upcoming first)
      const sortedEvents = data.sort((a: Event, b: Event) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      })

      setEvents(sortedEvents)
    } catch (err) {
      console.error("Error fetching upcoming events:", err)
      setError("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchEvents()
    setTimeout(() => setRefreshing(false), 500)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    } catch (e) {
      console.error("Error formatting date:", e)
      return dateString
    }
  }

  if (loading && !refreshing) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg p-4 flex gap-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-500 mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1">
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          Try Again
        </Button>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-2">No upcoming events</p>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1">
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event._id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative">
            {event.imageUrl ? (
              <div className="relative h-40 w-full">
                <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="h-40 w-full bg-emerald-600 flex items-center justify-center text-white">No image</div>
            )}
            {event.featured && (
              <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 text-white">Featured</Badge>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg mb-1">{event.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(event.startDate)}
                {event.endDate && event.endDate !== event.startDate && ` - ${formatDate(event.endDate)}`}
              </div>
              {event.location && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {event.location}
                </div>
              )}
            </div>
            <div className="text-right">
              <Button variant="link" size="sm" className="h-auto p-0 text-primary" asChild>
                <Link href={`/events/${event._id}`}>
                  View details <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="text-right">
        <Button variant="link" size="sm" className="text-primary" asChild>
          <Link href="/events">
            View all events <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
