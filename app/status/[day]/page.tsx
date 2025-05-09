import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ChevronLeft, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ContributorBadge from "@/components/contributor-badge"
import ShareButtons from "@/components/share-buttons"
import LoadingStatus from "@/components/loading-status"
import { getStatusPostByDay } from "@/lib/db/status-posts"
import { getUserById } from "@/lib/db/users"
import { MotionDiv, slideInLeft, slideInRight } from "@/components/ui/motion"

export async function generateMetadata({ params }: { params: { day: string } }) {
  const day = Number.parseInt(params.day)
  const status = await getStatusPostByDay(day)

  if (!status) {
    return {
      title: "Status Not Found - SUHBA Countdown",
      description: "The requested status could not be found.",
    }
  }

  return {
    title: `Day ${day}: ${status.title} - SUHBA Countdown`,
    description: status.description,
    openGraph: {
      images: [{ url: status.imageWebUrl }],
    },
  }
}

export default function StatusPage({ params }: { params: { day: string } }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-8 mx-auto">
        <MotionDiv
          className="flex items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/calendar">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Calendar
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Day {params.day}</h1>
        </MotionDiv>

        <Suspense fallback={<LoadingStatus />}>
          <StatusContent day={params.day} />
        </Suspense>
      </div>
    </main>
  )
}

async function StatusContent({ day }: { day: string }) {
  const dayNumber = Number.parseInt(day)
  const status = await getStatusPostByDay(dayNumber)

  if (!status) {
    notFound()
  }

  // Fetch contributor details if available
  let contributor = null
  if (status.contributedBy) {
    contributor = await getUserById(status.contributedBy)
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <MotionDiv initial="hidden" animate="visible" variants={slideInLeft}>
        <Card className="overflow-hidden transform transition-all hover:shadow-xl">
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={status.imageWebUrl || "/placeholder.svg"}
              alt={`Day ${day}: ${status.title}`}
              fill
              className="object-cover"
            />
          </div>
        </Card>
      </MotionDiv>

      <MotionDiv initial="hidden" animate="visible" variants={slideInRight}>
        <h2 className="mb-2 text-2xl font-bold">{status.title}</h2>
        <p className="flex items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(status.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <p className="mb-6 text-lg">{status.description}</p>

        {contributor && (
          <MotionDiv className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Content contributed by:</p>
            <ContributorBadge
              name={contributor.name}
              avatarUrl={contributor.avatarUrl || "/placeholder.svg"}
              badge={contributor.badge || "Contributor"}
            />
          </MotionDiv>
        )}

        <Separator className="my-6" />

        <MotionDiv className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="transition-transform hover:scale-105">
              <a href={status.imageHdUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download HD
              </a>
            </Button>
            <Button variant="outline" asChild className="transition-transform hover:scale-105">
              <a href={status.imageWebUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download Web
              </a>
            </Button>
          </div>

          <ShareButtons title={`Day ${day}: ${status.title}`} />
        </MotionDiv>
      </MotionDiv>
    </div>
  )
}
