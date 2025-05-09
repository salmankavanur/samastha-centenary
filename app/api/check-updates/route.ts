import { NextResponse } from "next/server"
import { getLatestContentTimestamp } from "@/lib/db/updates"

export async function GET() {
  try {
    // Get the latest content timestamp from the database
    const latestTimestamp = await getLatestContentTimestamp()

    // Check if there are updates in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const hasUpdates = latestTimestamp > fiveMinutesAgo

    return NextResponse.json({ hasUpdates, timestamp: latestTimestamp })
  } catch (error) {
    console.error("Error checking for updates:", error)
    return NextResponse.json({ hasUpdates: false, error: "Failed to check for updates" }, { status: 500 })
  }
}
