import { NextResponse } from "next/server"
import { getStatusPostByDay, updateStatusPost, deleteStatusPost } from "@/lib/db/status-posts"
import type { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { day: string } }) {
  try {
    const day = Number.parseInt(params.day)
    const post = await getStatusPostByDay(day)

    if (!post) {
      return NextResponse.json({ error: "Status post not found" }, { status: 404 })
    }

    const response = NextResponse.json(post)

    // Set cache control headers to allow revalidation
    response.headers.set("Cache-Control", "s-maxage=300, stale-while-revalidate=60")

    return response
  } catch (error) {
    console.error(`Error fetching status post for day ${params.day}:`, error)
    return NextResponse.json({ error: "Failed to fetch status post" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { day: string } }) {
  try {
    const day = Number.parseInt(params.day)
    const post = await getStatusPostByDay(day)

    if (!post) {
      return NextResponse.json({ error: "Status post not found" }, { status: 404 })
    }

    const data = await request.json()
    const result = await updateStatusPost(post._id as ObjectId, data)

    if (!result) {
      return NextResponse.json({ error: "Failed to update status post" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error updating status post for day ${params.day}:`, error)
    return NextResponse.json({ error: "Failed to update status post" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { day: string } }) {
  try {
    const day = Number.parseInt(params.day)
    const post = await getStatusPostByDay(day)

    if (!post) {
      return NextResponse.json({ error: "Status post not found" }, { status: 404 })
    }

    const result = await deleteStatusPost(post._id as ObjectId)

    if (!result) {
      return NextResponse.json({ error: "Failed to delete status post" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting status post for day ${params.day}:`, error)
    return NextResponse.json({ error: "Failed to delete status post" }, { status: 500 })
  }
}
