import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getNewsById } from "@/lib/db/news"
import { formatDate } from "@/lib/utils"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const news = await getNewsById(params.id)

  if (!news) {
    return {
      title: "News Not Found - SUHBA Countdown",
      description: "The requested news article could not be found.",
    }
  }

  return {
    title: `${news.title} - SUHBA Countdown`,
    description: news.summary,
  }
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const news = await getNewsById(params.id)

  if (!news || !news.published) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/news">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Link>
            </Button>
          </div>

          {news.imageUrl && (
            <div className="relative mb-6 rounded-lg overflow-hidden">
              <img src={news.imageUrl || "/placeholder.svg"} alt={news.title} className="w-full h-auto object-cover" />
              {news.featured && <Badge className="absolute top-4 right-4 bg-yellow-500">Featured</Badge>}
            </div>
          )}

          <h1 className="mb-4 text-3xl font-bold md:text-4xl malayalam-title">{news.title}</h1>

          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(new Date(news.publishedAt))}
            <span className="mx-2">•</span>
            By {news.author}
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8 malayalam-content">
            {news.content.split("\n").map((paragraph: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, index: Key | null | undefined) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {news.tags
                .filter((tag: any) => typeof tag === "string" || typeof tag === "number") // Filter valid keys
                .map((tag: string | number) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button variant="outline" asChild>
              <Link href="/news">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Link>
            </Button>

            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
