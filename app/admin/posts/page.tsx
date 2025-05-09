import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { Edit, Trash2, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAllStatusPosts } from "@/lib/db/status-posts"

export const metadata = {
  title: "Manage Posts - SUHBA Countdown",
  description: "Manage status posts for the SUHBA countdown calendar",
}

export default async function PostsPage() {
  // Fetch all status posts from MongoDB
  const posts = await getAllStatusPosts()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Posts</h1>
        <Button asChild>
          <Link href="/admin/uploads">Upload New Post</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No posts found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Start by uploading your first status post.</p>
          <Button asChild>
            <Link href="/admin/uploads">Upload First Post</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post._id?.toString()} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-48 h-48">
                    <Image
                      src={post.imageWebUrl || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">
                          Day {post.day}: {post.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(post.date), "MMMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant={post.isPublished ? "default" : "outline"}>
                        {post.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{post.description}</p>

                    <div className="mt-auto flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/status/${post.day}`} target="_blank">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
