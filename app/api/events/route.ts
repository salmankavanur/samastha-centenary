import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/db/models"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : undefined
    const featured = searchParams.get("featured") === "true"
    const published = searchParams.has("published") ? searchParams.get("published") === "true" : undefined
    const upcoming = searchParams.get("upcoming") === "true"

    console.log("API: Fetching events with params:", { limit, featured, published, upcoming })

    // Build the query
    const query: any = {}

    // Only filter by published if explicitly requested
    if (published !== undefined) {
      query.published = published
    }

    // Only filter by featured if explicitly requested
    if (featured) {
      query.featured = featured
    }

    // For upcoming events, compare with current date
    if (upcoming) {
      query.startDate = { $gte: new Date() }
    }

    console.log("MongoDB query:", JSON.stringify(query))

    // Get the collection and execute the query
    const collection = await getCollection(COLLECTIONS.EVENTS)

    // Sort by startDate (ascending - upcoming first)
    const events = await collection
      .find(query)
      .sort({ startDate: 1 }) // 1 means ascending order
      .limit(limit || 100)
      .toArray()

    console.log(`API: Found ${events.length} events`)

    // Convert MongoDB ObjectId to string for each event
    const serializedEvents = events.map((event) => ({
      ...event,
      _id: event._id.toString(),
    }))

    return NextResponse.json(serializedEvents, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("API: Error fetching events:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch events" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    console.log("API: Creating event with data:", data)

    // Validate required fields
    if (!data.title || !data.description || !data.location || !data.startDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, location, startDate" },
        { status: 400 },
      )
    }

    // Process dates
    if (data.startDate) {
      data.startDate = new Date(data.startDate)
    }

    if (data.endDate) {
      data.endDate = new Date(data.endDate)
    }

    // Set default values
    const eventData = {
      ...data,
      organizer: data.organizer || "SUHBA",
      published: data.published ?? false,
      featured: data.featured ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert the event
    const collection = await getCollection(COLLECTIONS.EVENTS)
    const result = await collection.insertOne(eventData)

    // Revalidate the events pages
    revalidatePath("/events")
    revalidatePath("/")

    return NextResponse.json({
      ...eventData,
      _id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("API: Error creating event:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create event" },
      { status: 500 },
    )
  }
}
