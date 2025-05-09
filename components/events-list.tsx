"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, RefreshCw, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface EventItem {
  _id: string
  title: string
  description: string
  location: string
  startDate: string
  endDate?: string
  imageUrl?: string
  featured: boolean
  tags?: string[]
}

export default function EventsList() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const timestamp = new Date().getTime()

      console.log("Frontend: Fetching events...")

      const response = await fetch(`/api/events?t=${timestamp}&published=true`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        console.error("Frontend: Error response status:", response.status)
        throw new Error(`Failed to fetch events: ${response.status}`)
      }

      const data = await response.json()
      console.log("Frontend: Received events data:", data)
      setEvents(data)
    } catch (err) {
      console.error("Frontend: Error fetching events:", err)
      setError("Failed to load events. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      })
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

  if (loading && !refreshing) {
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

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={handleRefresh} className="premium-button hover:text-white">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Try Again
        </Button>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No events available at the moment.</p>
        <Button onClick={handleRefresh} className="premium-button hover:text-white">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-1">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event._id} className="premium-card flex flex-col h-full">
            <div className="relative h-48 w-full overflow-hidden">
              {event.imageUrl ? (
                <div className="h-full w-full">
                  <img
                    src={`${event.imageUrl}?t=${new Date().getTime()}`}
                    alt={event.title}
                    className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-premium-teal to-premium-emerald flex items-center justify-center">
                  <span className="text-white text-lg">No image</span>
                </div>
              )}
              {event.featured && (
                <div className="absolute top-2 right-2">
                  <Badge className="premium-badge">Featured</Badge>
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <h3 className="text-xl font-bold malayalam-title premium-gradient-text">{event.title}</h3>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <p className="text-sm malayalam-content line-clamp-3">{event.description}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {new Date(event.startDate).toLocaleDateString()}
                  {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {event.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {event.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{event.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="ml-auto gap-1 text-premium-teal hover:text-white hover:bg-premium-teal"
              >
                <Link href={`/events/${event._id}`}>
                  View details <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
