import { NextResponse } from "next/server"
import { getAllStatusPosts, getRecentStatusPosts, createStatusPost } from "@/lib/db/status-posts"
import type { StatusPost } from "@/lib/db/models"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")
    const noCache = searchParams.get("noCache") === "true"

    let posts

    if (limit) {
      posts = await getRecentStatusPosts(Number.parseInt(limit))
    } else {
      posts = await getAllStatusPosts()
    }

    const response = NextResponse.json(posts)

    // Set cache control headers
    if (noCache) {
      response.headers.set("Cache-Control", "no-store, max-age=0")
    } else {
      // Cache for 5 minutes but allow revalidation
      response.headers.set("Cache-Control", "s-maxage=300, stale-while-revalidate=60")
    }

    return response
  } catch (error) {
    console.error("Error fetching status posts:", error)
    return NextResponse.json({ error: "Failed to fetch status posts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.day || !data.title || !data.imageHdUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the post
    const post: Omit<StatusPost, "_id" | "createdAt"> = {
      day: data.day,
      date: new Date(data.date),
      title: data.title,
      description: data.description,
      imageHdUrl: data.imageHdUrl,
      imageWebUrl: data.imageWebUrl || data.imageHdUrl,
      audioUrl: data.audioUrl || null,
      contributedBy: data.contributedBy || null,
      isPublished: data.isPublished ?? true,
    }

    const newPost = await createStatusPost(post)

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error("Error creating status post:", error)
    return NextResponse.json({ error: "Failed to create status post" }, { status: 500 })
  }
}
