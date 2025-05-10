"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface NewsItem {
  _id: string
  title: string
  summary: string
  content: string
  imageUrl?: string
  author: string
  authorId: string
  createdAt: string
  publishedAt: string
  featured: boolean
  tags?: string[]
}

export default function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/news?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`)
      }

      const data = await response.json()
      setNews(data)
    } catch (err) {
      console.error("Error fetching news:", err)
      setError("Failed to load news. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load news. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchNews()
    setTimeout(() => setRefreshing(false), 500)
  }

  useEffect(() => {
    fetchNews()
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

  if (news.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No news available at the moment.</p>
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
        {news.map((item) => (
          <Card key={item._id} className="premium-card flex flex-col h-full">
            <div className="relative h-48 w-full overflow-hidden">
              {item.imageUrl ? (
                <div className="h-full w-full">
                  <img
                    src={`${item.imageUrl}?t=${new Date().getTime()}`}
                    alt={item.title}
                    className="object-cover w-full h-full transition-transform hover:scale-105 duration-500"
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-premium-purple to-premium-blue flex items-center justify-center">
                  <span className="text-white text-lg">No image</span>
                </div>
              )}
              {item.featured && (
                <div className="absolute top-2 right-2">
                  <Badge className="premium-badge">Featured</Badge>
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <h3 className="text-xl font-bold malayalam-title premium-gradient-text">{item.title}</h3>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm malayalam-summary">{item.summary}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {item.tags?.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {(item.tags?.length ?? 0) > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{(item.tags?.length ?? 0) - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center">
              <div className="text-xs text-muted-foreground">{new Date(item.publishedAt).toLocaleDateString()}</div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-1 text-premium-indigo hover:text-white hover:bg-premium-indigo"
              >
                <Link href={`/news/${item._id}`}>
                  Read more <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
