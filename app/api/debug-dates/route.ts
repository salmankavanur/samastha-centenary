import { type NextRequest, NextResponse } from "next/server"
import {
  calculateCurrentDayNumber,
  getCountdownStartDate,
  getDateForDayNumber,
  getDayNumberForDate,
  EVENT_DATE,
  TOTAL_COUNTDOWN_DAYS,
  formatDate,
} from "@/lib/date-utils"

export async function GET(request: NextRequest) {
  // Get the date parameter from the query string
  const searchParams = request.nextUrl.searchParams
  const dateParam = searchParams.get("date")

  // Current date information
  const today = new Date()
  const currentDayNumber = calculateCurrentDayNumber()
  const countdownStartDate = getCountdownStartDate()
  const dateForCurrentDay = getDateForDayNumber(currentDayNumber)
  const daysRemaining = TOTAL_COUNTDOWN_DAYS - currentDayNumber

  // Basic response with current date information
  const response = {
    currentDate: formatDate(today),
    currentDateISO: today.toISOString(),
    countdownStartDate: formatDate(countdownStartDate),
    countdownStartDateISO: countdownStartDate.toISOString(),
    eventDate: formatDate(EVENT_DATE),
    eventDateISO: EVENT_DATE.toISOString(),
    currentDayNumber,
    totalDays: TOTAL_COUNTDOWN_DAYS,
    daysRemaining,
    dateForCurrentDay: formatDate(dateForCurrentDay),
    dateForCurrentDayISO: dateForCurrentDay.toISOString(),
  }

  // If a date parameter was provided, calculate information for that date
  if (dateParam) {
    const testDate = new Date(dateParam)
    const dayNumber = getDayNumberForDate(testDate)
    const daysUntilEvent = Math.ceil((EVENT_DATE.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysSinceStart = Math.floor((testDate.getTime() - countdownStartDate.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      ...response,
      testDate: formatDate(testDate),
      testDateISO: testDate.toISOString(),
      dayNumber,
      daysUntilEvent: Math.max(0, daysUntilEvent),
      daysSinceStart: Math.max(0, daysSinceStart),
    })
  }

  return NextResponse.json(response)
}
