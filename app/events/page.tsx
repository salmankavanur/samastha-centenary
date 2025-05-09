"use client"

import Link from "next/link"
import { Calendar, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

// Define the Event interface
interface Event {
  _id: string
  title: string
  description: string
  location: string
  startDate: string
  endDate?: string
  imageUrl?: string
  featured: boolean
  registrationRequired?: boolean
  organizer?: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const timestamp = new Date().getTime()

      console.log("Events Page: Fetching events...")

      // Only get published events
      const url = `/api/events?t=${timestamp}&published=true`
      console.log("Events Page: Fetching from URL:", url)

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
        console.error("Events Page: Error response status:", response.status)
        throw new Error(`Failed to fetch events: ${response.status}`)
      }

      const data = await response.json()
      console.log("Events Page: Received events data:", data)

      // Sort events by startDate (chronological order - upcoming first)
      // This is a backup sort in case the API doesn't sort correctly
      const sortedEvents = [...data].sort((a, b) => {
        const dateA = new Date(a.startDate).getTime()
        const dateB = new Date(b.startDate).getTime()
        return dateA - dateB
      })

      setEvents(sortedEvents)
    } catch (err) {
      console.error("Events Page: Error fetching events:", err)
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

  return (
    <main className="container px-4 py-8 mx-auto">
      <div className="flex flex-col items-center justify-center mb-12 text-center">
        <Calendar className="w-16 h-16 mb-4 text-primary" />
        <h1 className="text-4xl font-bold">Events & Activities</h1>
        <p className="max-w-2xl mt-2 text-lg text-muted-foreground">
          Discover upcoming events, workshops, and activities organized by SUHBA Countdown.
        </p>
      </div>

      {loading && !refreshing ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg shadow-md h-96">
              <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4 space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              {item.imageUrl ? (
                <div className="relative h-48 w-full">
                  <img
                    src={`${item.imageUrl}?_=${Date.now()}`}
                    alt={item.title}
                    className="object-cover w-full h-full"
                  />
                  {item.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-48 w-full bg-gradient-to-br from-premium-teal to-premium-emerald flex items-center justify-center">
                  <span className="text-white text-lg">No image</span>
                  {item.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{item.description}</p>
                <div className="flex items-center text-xs text-muted-foreground mb-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(item.startDate).toLocaleDateString()}
                  {item.endDate && ` - ${new Date(item.endDate).toLocaleDateString()}`}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {item.location}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <Button variant="link" className="p-0 h-auto hover:text-premium-teal" asChild>
                    <Link href={`/events/${item._id}`}>
                      View details
                      <ArrowLeft className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                  {item.registrationRequired && (
                    <div className="text-xs border border-gray-300 rounded px-2 py-1">Registration required</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No events available at the moment.</p>
          <Button onClick={handleRefresh} className="premium-button hover:text-white">
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </main>
  )
}
