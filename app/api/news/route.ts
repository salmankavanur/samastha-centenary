import { type NextRequest, NextResponse } from "next/server"
import { createNews, getAllNews } from "@/lib/db/news"
import { revalidatePath, revalidateTag } from "next/cache"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const published = searchParams.get("published")
    const featured = searchParams.get("featured")
    const limit = searchParams.get("limit")

    console.log("GET /api/news", { published, featured, limit })

    const options: any = {}

    if (published !== null) options.published = published === "true"
    if (featured !== null) options.featured = featured === "true"
    if (limit !== null) options.limit = Number.parseInt(limit)

    const news = await getAllNews(options)
    console.log(`Retrieved ${news.length} news items`)

    return NextResponse.json(news, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error in GET /api/news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("POST /api/news", data)

    // Validate required fields
    if (!data.title) return NextResponse.json({ error: "Title is required" }, { status: 400 })
    if (!data.summary) return NextResponse.json({ error: "Summary is required" }, { status: 400 })
    if (!data.content) return NextResponse.json({ error: "Content is required" }, { status: 400 })

    // Set default values if not provided
    const newsData = {
      ...data,
      author: data.author || "Suhba Admin",
      authorId: data.authorId || "admin",
      createdAt: data.createdAt || new Date().toISOString(),
      publishedAt: data.published ? data.publishedAt || new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    }

    const result = await createNews(newsData)
    console.log("News created:", result)

    // Revalidate paths
    revalidatePath("/news")
    revalidatePath("/")
    revalidateTag("news")

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error in POST /api/news:", error)
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 })
  }
}
