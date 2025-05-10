import Link from "next/link"
import { Suspense } from "react"
import { Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import RealTimeNewsList from "@/components/real-time-news-list"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "News - SUHBA Countdown",
  description: "Latest news and updates from SUHBA Countdown",
}

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Newspaper className="w-16 h-16 mb-4 text-primary" />
          <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">News & Updates</h1>
          <p className="max-w-2xl mb-6 text-lg text-gray-600 dark:text-gray-400">
            Stay informed with the latest news, announcements, and updates from Samastha Centenary Countdown.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-8 ">Loading news...</div>}>
          <RealTimeNewsList limit={9} />
        </Suspense>

        <div className="flex justify-center mt-8">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
