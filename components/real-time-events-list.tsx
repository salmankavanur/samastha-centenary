"use client"

import { useEffect } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Calendar, MapPin, ArrowRight, RefreshCw, AlertCircle } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"

interface Event {
  _id: string
  title: string
  description: string
  location: string
  startDate: string
  endDate?: string
  imageUrl?: string
  featured: boolean
  registrationRequired: boolean
}

// Custom fetcher that adds cache-busting
const fetcher = (url: string) => {
  const timestamp = new Date().getTime()
  const separator = url.includes("?") ? "&" : "?"
  return fetch(`${url}${separator}_=${timestamp}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  }).then((res) => res.json())
}

export default function RealTimeEventsList({
  featured = false,
  upcoming = true,
  limit = 3,
}: {
  featured?: boolean
  upcoming?: boolean
  limit?: number
}) {
  // Build the API URL with query parameters
  let apiUrl = `/api/events?published=true&limit=${limit}`
  if (featured) {
    apiUrl += "&featured=true"
  }
  if (upcoming) {
    apiUrl += "&upcoming=true"
  }

  // Use SWR for data fetching with auto-revalidation
  const {
    data: events,
    error,
    isLoading,
    mutate,
  } = useSWR(apiUrl, fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  })

  // Manual refresh function
  const handleRefresh = async () => {
    await mutate()
  }

  // Force refresh on mount and when component is focused
  useEffect(() => {
    handleRefresh()

    const onFocus = () => {
      handleRefresh()
    }

    window.addEventListener("focus", onFocus)
    return () => {
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: limit }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 animate-pulse mb-2 w-3/4" />
              <div className="h-4 bg-gray-200 animate-pulse mb-1 w-full" />
              <div className="h-4 bg-gray-200 animate-pulse mb-1 w-5/6" />
              <div className="h-4 bg-gray-200 animate-pulse w-4/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load events. Please try refreshing the page.
          <Button variant="outline" size="sm" className="ml-2" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No events available at the moment.</p>
        <Button variant="outline" className="mt-4" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((item: Event) => (
          <Card key={item._id} className="overflow-hidden hover:shadow-md transition-shadow">
            {item.imageUrl ? (
              <div className="relative h-48 w-full">
                <img
                  src={`${item.imageUrl}?_=${Date.now()}`} // Add cache-busting parameter to image URL
                  alt={item.title}
                  className="object-cover w-full h-full"
                />
                {item.featured && <Badge className="absolute top-2 right-2 bg-yellow-500">Featured</Badge>}
              </div>
            ) : (
              <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
                {item.featured && <Badge className="absolute top-2 right-2 bg-yellow-500">Featured</Badge>}
              </div>
            )}
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{item.description}</p>
              <div className="flex items-center text-xs text-muted-foreground mb-1">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(new Date(item.startDate))}
                {item.endDate && ` - ${formatDate(new Date(item.endDate))}`}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                {item.location}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href={`/events/${item._id}`}>
                  View details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              {item.registrationRequired && (
                <Badge variant="outline" className="ml-auto">
                  Registration required
                </Badge>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center mt-4">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  )
}
