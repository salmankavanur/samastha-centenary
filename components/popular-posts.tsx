"use client"

import { useEffect, useState } from "react"
import { Eye, MessageSquare, ThumbsUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Post {
  id: string
  title: string
  views: number
  likes: number
  comments: number
  date: string
}

export default function PopularPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchPopularPosts = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Sample data
        const samplePosts = [
          {
            id: "1",
            title: "The History of Traditional Crafts in Our Region",
            views: 1245,
            likes: 89,
            comments: 32,
            date: "2023-05-20",
          },
          {
            id: "2",
            title: "Oral Histories: Preserving Elder Stories",
            views: 987,
            likes: 76,
            comments: 28,
            date: "2023-05-15",
          },
          {
            id: "3",
            title: "Architectural Heritage: Documenting Historic Buildings",
            views: 876,
            likes: 65,
            comments: 21,
            date: "2023-05-10",
          },
          {
            id: "4",
            title: "Cultural Festivals Through the Decades",
            views: 754,
            likes: 54,
            comments: 18,
            date: "2023-05-05",
          },
        ]

        setPosts(samplePosts)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch popular posts:", error)
        setLoading(false)
      }
    }

    fetchPopularPosts()
  }, [])

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Popular Posts</CardTitle>
        <CardDescription>Most viewed and engaged content</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <div className="flex space-x-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium line-clamp-1">{post.title}</h4>
                  <span className="text-xs text-muted-foreground">{formatDate(post.date)}</span>
                </div>
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    <span>{post.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <ThumbsUp className="mr-1 h-3.5 w-3.5" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="mr-1 h-3.5 w-3.5" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No popular posts found</p>
        )}
      </CardContent>
    </Card>
  )
}
