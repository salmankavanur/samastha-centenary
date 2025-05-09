import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/db/models"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const collection = await getCollection(COLLECTIONS.EVENTS)

    // Get counts
    const totalCount = await collection.countDocuments()
    const publishedCount = await collection.countDocuments({ published: true })
    const featuredCount = await collection.countDocuments({ featured: true })

    // Get sample events
    const sampleEvents = await collection.find().limit(5).toArray()

    // Convert ObjectId to string
    const serializedEvents = sampleEvents.map((event) => ({
      ...event,
      _id: event._id.toString(),
    }))

    return NextResponse.json(
      {
        status: "success",
        counts: {
          total: totalCount,
          published: publishedCount,
          featured: featuredCount,
        },
        sampleEvents: serializedEvents,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Error in debug-events:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
