import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getAllStatusPosts } from "@/lib/db/status-posts"
import { MotionDiv, staggerContainer, fadeIn } from "@/components/ui/motion"
import { Sparkles } from "lucide-react"
import {
  calculateCurrentDayNumber,
  getDateForDayNumber,
  TOTAL_COUNTDOWN_DAYS,
  formatDate,
  debugDates,
} from "@/lib/date-utils"

export default async function CalendarGrid() {
  // Debug dates to help diagnose issues
  debugDates()

  // Fetch status posts from MongoDB
  const posts = await getAllStatusPosts()

  // Calculate the current day number
  const currentDayNumber = calculateCurrentDayNumber()
  const today = new Date()

  // If no posts exist yet, show a placeholder
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No status posts available yet. The countdown will begin soon!</p>
      </div>
    )
  }

  // Create a map of day numbers to posts for easy lookup
  const postsByDay = new Map(posts.map((post) => [post.day, post]))

  // Generate all days from 300 down to 1 (descending order)
  const days = Array.from({ length: TOTAL_COUNTDOWN_DAYS }, (_, i) => {
    const dayNumber = TOTAL_COUNTDOWN_DAYS - i // Count down from 300 to 1
    const post = postsByDay.get(dayNumber)
    const date = getDateForDayNumber(dayNumber)

    return {
      day: dayNumber,
      date: date,
      isPublished: !!post?.isPublished,
      isToday: dayNumber === currentDayNumber,
      daysUntilEvent: dayNumber - 1,
    }
  })

  // For debugging - log the current day calculation
  console.log("Calendar Grid Rendering:", {
    currentDayNumber,
    currentDate: today.toISOString(),
    formattedCurrentDate: formatDate(today),
    dayForCurrentNumber: getDateForDayNumber(currentDayNumber).toISOString(),
    formattedDayForCurrentNumber: formatDate(getDateForDayNumber(currentDayNumber)),
  })

  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
        <h2 className="text-xl font-bold mb-2">Event: February 4-8, 2026</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Today is Day {currentDayNumber} of 300 • {currentDayNumber - 1} days remaining
        </p>
        <p className="text-xs text-gray-500 mt-1">Server date: {formatDate(today)}</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Showing all 300 days (descending order)</h3>
        <div className="bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full text-sm">
          <span className="font-medium">Current Day: {currentDayNumber}</span>
        </div>
      </div>

      <MotionDiv
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {days.map((day, index) => (
          <MotionDiv
            key={day.day}
            variants={fadeIn}
            custom={index}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={day.isToday ? "z-10 transform scale-105" : ""}
          >
            <CalendarDay
              day={day.day}
              date={day.date}
              isPublished={day.isPublished}
              isToday={day.isToday}
              daysUntilEvent={day.daysUntilEvent}
            />
          </MotionDiv>
        ))}
      </MotionDiv>
    </div>
  )
}

function CalendarDay({
  day,
  date,
  isPublished,
  isToday,
  daysUntilEvent,
}: {
  day: number
  date: Date
  isPublished: boolean
  isToday: boolean
  daysUntilEvent: number
}) {
  const formattedDate = format(date, "MMM d, yyyy")

  return (
    <Link
      href={isPublished ? `/status/${day}` : "#"}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-lg transition-all",
        isPublished ? "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" : "opacity-70 cursor-not-allowed",
        isToday
          ? "bg-gradient-to-br from-blue-500/20 via-green-500/20 to-yellow-500/20 dark:from-blue-600/40 dark:via-green-600/40 dark:to-yellow-600/40 border-3 border-green-600 shadow-lg shadow-green-500/20 dark:shadow-green-500/10 ring-4 ring-green-300/30 dark:ring-green-700/30"
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
      )}
    >
      {/* Special highlight effect for today */}
      {isToday && (
        <div className="absolute inset-0 rounded-lg bg-green-500/10 border border-green-400 dark:border-green-600 shadow-inner pointer-events-none animate-pulse"></div>
      )}

      {/* Day number with special styling for today */}
      <span className={cn("text-2xl font-bold", isToday && "text-green-700 dark:text-green-400 drop-shadow-sm")}>
        {day}
      </span>

      <span className={cn("text-xs text-gray-500", isToday && "text-green-700 dark:text-green-300 font-medium")}>
        {formattedDate}
      </span>

      <span className={cn("text-xs text-gray-400 mt-1", isToday && "text-green-700 dark:text-green-300 font-medium")}>
        {daysUntilEvent} days left
      </span>

      {/* Status badges */}
      {isToday && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <span className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-full shadow-md border border-white dark:border-green-900 animate-pulse">
            TODAY
          </span>
        </div>
      )}

      {isPublished && !isToday && (
        <span className="absolute top-1 right-1 px-1.5 py-0.5 text-xs font-medium text-white bg-blue-500 rounded-full">
          Published
        </span>
      )}

      {isPublished && isToday && (
        <span className="absolute top-1 right-1 px-1.5 py-0.5 text-xs font-medium text-white bg-blue-600 rounded-full animate-pulse">
          Published
        </span>
      )}

      {!isPublished && !isToday && (
        <span className="absolute top-1 right-1 px-1.5 py-0.5 text-xs font-medium text-white bg-gray-500 rounded-full">
          Coming Soon
        </span>
      )}

      {/* Special star indicator for today */}
      {isToday && (
        <>
          <div className="absolute -bottom-2 -left-2">
            <Sparkles className="w-6 h-6 text-yellow-500 fill-current animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2">
            <Sparkles className="w-6 h-6 text-yellow-500 fill-current animate-pulse" />
          </div>
        </>
      )}
    </Link>
  )
}
