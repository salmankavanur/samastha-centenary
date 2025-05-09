/**
 * Date utility functions for the SUHBA application
 */

// Define the event date (February 4, 2026)
export const EVENT_DATE = new Date(2026, 1, 4) // Month is 0-indexed, so 1 = February
export const TOTAL_COUNTDOWN_DAYS = 300

/**
 * Calculate the countdown start date (300 days before the event)
 */
export function getCountdownStartDate(): Date {
  const startDate = new Date(EVENT_DATE)
  startDate.setDate(EVENT_DATE.getDate() - (TOTAL_COUNTDOWN_DAYS - 1))
  return startDate
}

/**
 * Calculate the current day number in the countdown (300 to 1)
 * Day 300 is the first day of the countdown
 * Day 1 is the day before the event
 * @returns The current day number in the countdown (300 to 1)
 */
export function calculateCurrentDayNumber(): number {
  const today = new Date()
  const startDate = getCountdownStartDate()

  // Calculate days elapsed since countdown start
  const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Current day is days elapsed + 1 (since day 1 is the first day)
  // Make sure it's within valid range (1 to 300)
  const daysSinceStart = Math.max(0, Math.min(daysElapsed, TOTAL_COUNTDOWN_DAYS - 1))

  // Convert to countdown day (300 down to 1)
  const countdownDay = TOTAL_COUNTDOWN_DAYS - daysSinceStart

  console.log("Date calculation:", {
    today: today.toISOString(),
    startDate: startDate.toISOString(),
    daysElapsed,
    daysSinceStart,
    countdownDay,
  })

  return countdownDay
}

/**
 * Calculate the date for a specific day number in the countdown
 * @param dayNumber The day number in the countdown (300 to 1)
 * @returns The date for that day number
 */
export function getDateForDayNumber(dayNumber: number): Date {
  // Validate day number
  if (dayNumber < 1 || dayNumber > TOTAL_COUNTDOWN_DAYS) {
    console.error(`Invalid day number: ${dayNumber}. Must be between 1 and ${TOTAL_COUNTDOWN_DAYS}`)
    return new Date()
  }

  // Calculate days from countdown start
  const daysFromStart = TOTAL_COUNTDOWN_DAYS - dayNumber

  // Create a new date by adding days to countdown start
  const date = new Date(getCountdownStartDate())
  date.setDate(date.getDate() + daysFromStart)

  return date
}

/**
 * Get the day number for a specific date
 * @param date The date to get the day number for
 * @returns The day number in the countdown (300 to 1)
 */
export function getDayNumberForDate(date: Date): number {
  const startDate = getCountdownStartDate()

  // Calculate days elapsed since countdown start
  const daysElapsed = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Convert to countdown day (300 down to 1)
  const countdownDay = TOTAL_COUNTDOWN_DAYS - daysElapsed

  // Make sure it's within valid range (1 to 300)
  return Math.max(1, Math.min(countdownDay, TOTAL_COUNTDOWN_DAYS))
}

/**
 * Calculate days remaining until the event
 */
export function getDaysRemaining(): number {
  const today = new Date()
  const daysRemaining = Math.ceil((EVENT_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, daysRemaining)
}

/**
 * Format a date as a string (e.g., "May 7, 2025")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Debug function to print all important dates
 */
export function debugDates(): void {
  const today = new Date()
  const startDate = getCountdownStartDate()
  const currentDay = calculateCurrentDayNumber()
  const dateForCurrentDay = getDateForDayNumber(currentDay)

  console.log("DEBUG DATES:", {
    today: today.toISOString(),
    formattedToday: formatDate(today),
    startDate: startDate.toISOString(),
    formattedStartDate: formatDate(startDate),
    eventDate: EVENT_DATE.toISOString(),
    formattedEventDate: formatDate(EVENT_DATE),
    currentDay,
    daysRemaining: currentDay - 1,
    dateForCurrentDay: dateForCurrentDay.toISOString(),
    formattedDateForCurrentDay: formatDate(dateForCurrentDay),
  })
}
