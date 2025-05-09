import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paths = searchParams.getAll("path")

    if (!paths.length) {
      // Default paths to revalidate if none provided
      revalidatePath("/")
      revalidatePath("/news")
      revalidatePath("/events")

      return NextResponse.json({
        revalidated: true,
        paths: ["/", "/news", "/events"],
        timestamp: Date.now(),
      })
    }

    // Revalidate all provided paths
    for (const path of paths) {
      revalidatePath(path)
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Error revalidating paths:", error)
    return NextResponse.json({ error: "Failed to revalidate paths" }, { status: 500 })
  }
}
