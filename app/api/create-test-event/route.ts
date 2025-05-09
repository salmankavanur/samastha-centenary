import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/db/models"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create a test event
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const testEvent = {
      title: `Test Event ${now.toISOString().replace(/[:.]/g, "-")}`,
      description: "This is a test event created for debugging purposes.",
      location: "Test Location",
      startDate: now,
      endDate: tomorrow,
      organizer: "SUHBA Admin",
      published: true,
      featured: true,
      registrationRequired: false,
      createdAt: now,
      updatedAt: now,
    }

    const collection = await getCollection(COLLECTIONS.EVENTS)
    const result = await collection.insertOne(testEvent)

    // Revalidate paths
    revalidatePath("/events")
    revalidatePath("/")
    revalidatePath("/admin/events")

    return NextResponse.json({
      status: "success",
      message: "Test event created successfully",
      eventId: result.insertedId.toString(),
      event: {
        ...testEvent,
        _id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("Error creating test event:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
