import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getNewsById, updateNews, deleteNews } from "@/lib/db/news"
import { revalidatePath } from "next/cache"

// GET /api/news/[id] - Get a specific news item
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const newsItem = await getNewsById(params.id)

    if (!newsItem) {
      return NextResponse.json({ error: "News not found" }, { status: 404 })
    }

    return NextResponse.json(newsItem)
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}

// PATCH /api/news/[id] - Update a news item
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Check if the news exists
    const existingNews = await getNewsById(params.id)
    if (!existingNews) {
      return NextResponse.json({ error: "News not found" }, { status: 404 })
    }

    // Handle publishing status change
    if (data.published && !existingNews.published) {
      data.publishedAt = new Date()
    }

    const success = await updateNews(params.id, data)

    if (!success) {
      return NextResponse.json({ error: "Failed to update news" }, { status: 500 })
    }

    // Revalidate the news pages
    revalidatePath("/news")
    revalidatePath(`/news/${params.id}`)
    revalidatePath("/")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating news:", error)
    return NextResponse.json({ error: "Failed to update news" }, { status: 500 })
  }
}

// DELETE /api/news/[id] - Delete a news item
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await deleteNews(params.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete news" }, { status: 404 })
    }

    // Revalidate the news pages
    revalidatePath("/news")
    revalidatePath("/")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting news:", error)
    return NextResponse.json({ error: "Failed to delete news" }, { status: 500 })
  }
}
