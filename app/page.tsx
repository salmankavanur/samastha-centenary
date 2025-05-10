import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays, Download, Share2, Newspaper, Calendar, ArrowRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CountdownTimer from "@/components/countdown-timer"
import RecentPosts from "@/components/recent-posts"
import InstallPWA from "@/components/install-pwa"
import LoadingPosts from "@/components/loading-posts"
import { getTodayStatusPost } from "@/lib/db/status-posts"
import { MotionDiv, MotionSection, fadeIn, slideUp, staggerContainer, slideInLeft } from "@/components/ui/motion"
import { calculateCurrentDayNumber, TOTAL_COUNTDOWN_DAYS } from "@/lib/date-utils"
import { getNews } from "@/lib/db/news"
import { getCollection } from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/db/models"
import { differenceInCalendarDays } from 'date-fns';

const EVENT_DATE = new Date('2026-02-04'); // Event start date
const TODAY = new Date(); // Server date (or use new Date(serverDate) if passed from backend)

const remainingDays = differenceInCalendarDays(EVENT_DATE, TODAY);



// Force dynamic rendering at the page level
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  // Get the current day number and today's status
  const currentDay = calculateCurrentDayNumber()
  const todayStatus = await getTodayStatusPost()

  // Fetch news directly on the server
  const news = await getNews({ limit: 3, published: true })

  // Fetch all published events directly from MongoDB to ensure we get all events
  const eventsCollection = await getCollection(COLLECTIONS.EVENTS)
  const allEvents = await eventsCollection
    .find({ published: true })
    .sort({ startDate: 1 }) // Sort by date (ascending - upcoming first)
    .limit(3)
    .toArray()

  // Convert MongoDB ObjectId to string for each event
  const events = allEvents.map((event) => ({
    ...event,
    _id: event._id.toString(),
    imageUrl: event.imageUrl || null, // Ensure imageUrl is defined
    title: event.title || "Untitled Event", // Ensure title is defined
    description: event.description || "No description available", // Ensure description is defined
    featured: event.featured || false, // Ensure featured is defined
    startDate: event.startDate || null, // Ensure startDate is defined
    endDate: event.endDate || null, // Ensure endDate is defined
    location: event.location || "Location not specified", // Ensure location is defined
    registrationRequired: event.registrationRequired || false, // Ensure registrationRequired is defined
  }))

  console.log(`Homepage: Found ${events.length} events for display`)

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-8 mx-auto">
        {/* Hero Section */}
        <MotionSection
          className="flex flex-col items-center justify-center py-12 text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <MotionDiv variants={fadeIn} className="relative w-32 h-32 mb-6">
            <Image
              src="/favicon.png"
              alt="Samastha Centenary Logo"
              fill
              className="object-contain"
              priority
            />
          </MotionDiv>
          <MotionDiv variants={slideUp} className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">
            Samastha Centenary Countdown
          </MotionDiv>
          <MotionDiv variants={slideUp} className="max-w-2xl mb-6 text-lg text-gray-600 dark:text-gray-400">
            SUHBA - Students Union for Suffa Dars Coordination under Alathurpadi Dars
          </MotionDiv>

          {/* Countdown Timer */}
          <MotionDiv variants={slideUp}>
            <CountdownTimer targetDate="2026-02-04" />
          </MotionDiv>

          <MotionDiv variants={slideUp} className="flex flex-wrap justify-center gap-4 mt-8">
            <Button asChild size="lg" className="transition-transform hover:scale-105">
              <Link href="/calendar">
                <CalendarDays className="w-5 h-5 mr-2" />
                View Calendar
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="transition-transform hover:scale-105">
              <Link href="/contribute">Contribute Content</Link>
            </Button>
          </MotionDiv>
        </MotionSection>

        {/* Today's Status */}
        <MotionSection
          className="py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <MotionDiv variants={slideInLeft} className="mb-8 text-3xl font-bold text-center">
            Today's Status
            <div className="text-sm font-normal text-gray-500 mt-1">
              Day {currentDay} of {TOTAL_COUNTDOWN_DAYS} • {remainingDays} days remaining
              {/* Day {currentDay} of {TOTAL_COUNTDOWN_DAYS} • {TOTAL_COUNTDOWN_DAYS - currentDay} days remaining */}
              {/* Day {currentDayNumber} of 300 • {currentDayNumber - 1} days remaining */}
            </div>
          </MotionDiv>

          {todayStatus ? (
            <MotionDiv variants={slideUp}>
              <Card className="overflow-hidden max-w-2xl mx-auto transform transition-all hover:shadow-lg">
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={`${todayStatus.imageWebUrl || "/placeholder.svg"}?_=${Date.now()}`}
                    alt={`Day ${todayStatus.day}: ${todayStatus.title}`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="mb-2 text-xl font-semibold">
                    Day {todayStatus.day}: {todayStatus.title}
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">{todayStatus.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="transition-transform hover:scale-105">
                      <a href={todayStatus.imageHdUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                    <Button variant="outline" asChild className="transition-transform hover:scale-105">
                      <Link href={`/status/${todayStatus.day}`}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Link>
                    </Button>
                    <Button variant="link" asChild>
                      <Link href={`/status/${todayStatus.day}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No status available for today. Check back soon!</p>
            </div>
          )}
        </MotionSection>

        {/* News Section */}
        <MotionSection
          className="py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn}
        >
          <MotionDiv variants={slideInLeft} className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Latest News</h2>
            <Button variant="outline" asChild>
              <Link href="/news">
                <Newspaper className="w-4 h-4 mr-2" />
                View All News
              </Link>
            </Button>
          </MotionDiv>

          {/* Server-rendered news list */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.length > 0 ? (
              news.map((item) => (
                <Card key={item._id.toString()} className="overflow-hidden hover:shadow-md transition-shadow">
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
                    <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                      {item.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                          Featured
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 malayalam-title">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-3 malayalam-summary">{item.summary}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(item.publishedAt).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      By {item.author}
                    </div>
                    <div className="mt-4">
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href={`/news/${item._id}`}>
                          Read more
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">No news available at the moment.</p>
              </div>
            )}
          </div>
        </MotionSection>

        {/* Events Section */}
        <MotionSection
          className="py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn}
        >
          <MotionDiv variants={slideInLeft} className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Upcoming Events</h2>
            <Button variant="outline" asChild>
              <Link href="/events">
                <Calendar className="w-4 h-4 mr-2" />
                View All Events
              </Link>
            </Button>
          </MotionDiv>

          {/* Server-rendered events list */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.length > 0 ? (
              events.map((item) => (
                <Card key={item._id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                    <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                      {item.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                          Featured
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 malayalam-title">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-3 malayalam-content">{item.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground mb-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(item.startDate).toLocaleDateString()}
                      {item.endDate && ` - ${new Date(item.endDate).toLocaleDateString()}`}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {item.location}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href={`/events/${item._id}`}>
                          View details
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                      {item.registrationRequired && (
                        <div className="text-xs border border-gray-300 rounded px-2 py-1">Registration required</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">No events available at the moment.</p>
              </div>
            )}
          </div>
        </MotionSection>

        {/* Recent Posts */}
        <MotionSection
          className="py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn}
        >
          <MotionDiv variants={slideInLeft} className="mb-8 text-3xl font-bold text-center">
            Recent Posts
          </MotionDiv>
          <Suspense fallback={<LoadingPosts />}>
            <RecentPosts />
          </Suspense>
        </MotionSection>

        {/* PWA Install Prompt */}
        <MotionSection
          className="py-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideUp}
        >
          <InstallPWA />
        </MotionSection>
      </div>
    </main>
  )
}
