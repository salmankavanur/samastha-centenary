"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Trash2, Star, StarOff, Eye, EyeOff, RefreshCw, Plus } from "lucide-react"
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

interface News {
  _id: string
  title: string
  summary: string
  content: string
  imageUrl?: string
  author: string
  published: boolean
  publishedAt: string | null
  createdAt: string
  featured: boolean
  tags?: string[]
}

export default function AdminNewsList({ filter = "all" }: { filter?: string }) {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [filter])

  async function fetchNews() {
    setLoading(true)
    try {
      let url = "/api/news"

      // Add cache-busting parameter
      const timestamp = new Date().getTime()
      url += `?_=${timestamp}`

      if (filter === "published") {
        url += "&published=true"
      } else if (filter === "drafts") {
        url += "&published=false"
      } else if (filter === "featured") {
        url += "&featured=true"
      }

      console.log("Fetching news from:", url)

      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch news")

      const data = await response.json()
      console.log(`Fetched ${data.length} news items:`, data)
      setNews(data)
    } catch (error) {
      console.error("Error fetching news:", error)
      toast({
        title: "Error",
        description: "Failed to load news. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/news/${deleteId}`, {
        method: "DELETE",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      if (!response.ok) throw new Error("Failed to delete news")

      toast({
        title: "Success",
        description: "News deleted successfully",
      })

      // Remove from local state
      setNews(news.filter((item) => item._id !== deleteId))

      // Force revalidation
      await fetch("/api/force-refresh", { method: "GET" })
    } catch (error) {
      console.error("Error deleting news:", error)
      toast({
        title: "Error",
        description: "Failed to delete news. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  async function togglePublished(id: string, published: boolean) {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        body: JSON.stringify({
          published: !published,
          publishedAt: !published ? new Date().toISOString() : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update news")

      toast({
        title: "Success",
        description: `News ${!published ? "published" : "unpublished"} successfully`,
      })

      // Update local state
      setNews(news.map((item) => (item._id === id ? { ...item, published: !published } : item)))

      // Force revalidation
      await fetch("/api/force-refresh", { method: "GET" })
    } catch (error) {
      console.error("Error updating news:", error)
      toast({
        title: "Error",
        description: "Failed to update news. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function toggleFeatured(id: string, featured: boolean) {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        body: JSON.stringify({ featured: !featured }),
      })

      if (!response.ok) throw new Error("Failed to update news")

      toast({
        title: "Success",
        description: `News ${!featured ? "featured" : "unfeatured"} successfully`,
      })

      // Update local state
      setNews(news.map((item) => (item._id === id ? { ...item, featured: !featured } : item)))

      // Force revalidation
      await fetch("/api/force-refresh", { method: "GET" })
    } catch (error) {
      console.error("Error updating news:", error)
      toast({
        title: "Error",
        description: "Failed to update news. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await fetch("/api/force-refresh", { method: "GET" })
      await fetchNews()
      toast({
        title: "Success",
        description: "News list refreshed",
      })
    } catch (error) {
      console.error("Error refreshing news:", error)
      toast({
        title: "Error",
        description: "Failed to refresh news. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading news...</div>
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No news found</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={handleRefresh} disabled={refreshing} className="hover:text-white">
            {refreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          <Button asChild className="hover:text-white">
            <Link href="/admin/news?action=create">
              <Plus className="w-4 h-4 mr-2" />
              Add News
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <Button asChild className="w-full sm:w-auto hover:text-white">
          <Link href="/admin/news?action=create">
            <Plus className="w-4 h-4 mr-2" />
            Add News
          </Link>
        </Button>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="w-full sm:w-auto">
          {refreshing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <Card key={item._id} className="overflow-hidden">
            {item.imageUrl && (
              <div className="relative h-48 w-full">
                <img src={`${item.imageUrl}?t=${Date.now()}`} alt={item.title} className="object-cover w-full h-full" />
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold line-clamp-2 malayalam-font">{item.title}</h3>
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
              <p className="text-sm text-muted-foreground line-clamp-3 mb-2 malayalam-font">{item.summary}</p>
              <div className="text-xs text-muted-foreground">
                {item.published && item.publishedAt ? (
                  <p>Published: {formatDate(new Date(item.publishedAt))}</p>
                ) : (
                  <p>Created: {formatDate(new Date(item.createdAt))}</p>
                )}
                <p>By: {item.author}</p>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-wrap justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/news?action=edit&id=${item._id}`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleFeatured(item._id, item.featured)}>
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
                <Button variant="outline" size="sm" onClick={() => togglePublished(item._id, item.published)}>
                  {item.published ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Publish
                    </>
                  )}
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
              This action cannot be undone. This will permanently delete the news article.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="hover:text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
