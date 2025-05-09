import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { getRecentStatusPosts } from "@/lib/db/status-posts"
import { MotionDiv, staggerContainer, slideUp } from "@/components/ui/motion"

// Set dynamic rendering to prevent caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function RecentPosts() {
  // Fetch recent posts from MongoDB
  const posts = await getRecentStatusPosts(7)

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No posts available yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div>
      <MotionDiv
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {posts.map((post, index) => (
          <MotionDiv key={post._id?.toString()} variants={slideUp} custom={index}>
            <Card className="overflow-hidden transform transition-all hover:shadow-lg hover:scale-105">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={post.imageWebUrl || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
                <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white bg-black/50 rounded">
                  Day {post.day}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium truncate">{post.title}</h3>
                <p className="text-xs text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
                <Button variant="link" asChild className="p-0 mt-2 h-auto">
                  <Link href={`/status/${post.day}`}>
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </MotionDiv>
        ))}
      </MotionDiv>

      <div className="flex justify-center mt-8">
        <Button asChild className="transition-transform hover:scale-105">
          <Link href="/calendar">View All Posts</Link>
        </Button>
      </div>
    </div>
  )
}
