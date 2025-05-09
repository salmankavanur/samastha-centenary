import { getNews } from "./news"
import { getEvents } from "./events"
import { getTodayStatusPost } from "./status-posts"

export async function getLatestContentTimestamp(): Promise<Date> {
  try {
    // Get the latest news
    const news = await getNews({ limit: 1 })

    // Get the latest events
    const events = await getEvents({ limit: 1 })

    // Get today's status post
    const todayStatus = await getTodayStatusPost()

    // Collect all timestamps
    const timestamps = []

    if (news.length > 0) {
      timestamps.push(new Date(news[0].updatedAt || news[0].publishedAt))
    }

    if (events.length > 0) {
      timestamps.push(new Date(events[0].updatedAt || events[0].createdAt))
    }

    if (todayStatus) {
      timestamps.push(new Date(todayStatus.updatedAt || todayStatus.createdAt))
    }

    // Return the most recent timestamp
    if (timestamps.length > 0) {
      return new Date(Math.max(...timestamps.map((t) => t.getTime())))
    }

    // If no content found, return current time
    return new Date()
  } catch (error) {
    console.error("Error getting latest content timestamp:", error)
    return new Date()
  }
}
