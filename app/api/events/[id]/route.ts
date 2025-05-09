import { type NextRequest, NextResponse } from "next/server"
import { getEventById, updateEvent, deleteEvent } from "@/lib/db/events"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`API: Fetching event with ID: ${id}`)

    const event = await getEventById(id)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Convert MongoDB ObjectId to string
    return NextResponse.json(
      {
        ...event,
        _id: event._id.toString(),
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
    console.error(`API: Error fetching event with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch event" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const data = await request.json()
    console.log(`API: Updating event with ID: ${id}`, data)

    // Process dates if they're strings
    if (data.startDate && typeof data.startDate === "string") {
      data.startDate = new Date(data.startDate)
    }

    if (data.endDate && typeof data.endDate === "string") {
      data.endDate = new Date(data.endDate)
    }

    const success = await updateEvent(id, { ...data, updatedAt: new Date() })
    if (!success) {
      return NextResponse.json({ error: "Event not found or not updated" }, { status: 404 })
    }

    // Revalidate the events pages
    revalidatePath("/events")
    revalidatePath(`/events/${id}`)
    revalidatePath("/")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`API: Error updating event with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update event" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    console.log(`API: Deleting event with ID: ${id}`)

    const success = await deleteEvent(id)
    if (!success) {
      return NextResponse.json({ error: "Event not found or not deleted" }, { status: 404 })
    }

    // Revalidate the events pages
    revalidatePath("/events")
    revalidatePath("/")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`API: Error deleting event with ID ${params.id}:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete event" },
      { status: 500 },
    )
  }
}
