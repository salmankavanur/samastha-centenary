import { Suspense } from "react"
import Link from "next/link"
import { ChevronLeft, CalendarIcon, InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import CalendarGrid from "@/components/calendar-grid"
import LoadingCalendar from "@/components/loading-calendar"
import { debugDates } from "@/lib/date-utils"

// Set dynamic rendering to prevent caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "300-Day Countdown Calendar - SUHBA Countdown",
  description: "Browse the complete 300-day countdown calendar for Suffa Dars Coordination",
}

export default function CalendarPage() {
  // Debug dates to help diagnose issues
  debugDates()

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">300-Day Countdown Calendar</h1>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-4">
            <CalendarIcon className="w-10 h-10 text-blue-500 mt-1" />
            <div>
              <h2 className="text-xl font-bold mb-2">Suffa Dars Coordination Event</h2>
              <p className="text-gray-700 dark:text-gray-300">
                This calendar shows the complete 300-day countdown to the Suffa Dars Coordination event scheduled for
                February 4-8, 2026. Days are displayed in descending order from 300 down to 1.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-start gap-4">
            <InfoIcon className="w-6 h-6 text-yellow-600 mt-1" />
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">How to read this calendar:</span> Each box represents one day in the
                countdown. Day 300 is the first day of the countdown, and Day 1 is the day before the event. Published
                days have content you can view by clicking on them.
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<LoadingCalendar />}>
          <CalendarGrid />
        </Suspense>
      </div>
    </main>
  )
}
