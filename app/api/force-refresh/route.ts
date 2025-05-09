import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Revalidate specific paths
    const paths = ["/", "/news", "/events", "/calendar", "/admin/news", "/admin/events"]

    // Revalidate all paths
    for (const path of paths) {
      revalidatePath(path)
      console.log(`Revalidated path: ${path}`)
    }

    // Revalidate tags
    const tags = ["news", "events", "calendar", "status"]

    for (const tag of tags) {
      revalidateTag(tag)
      console.log(`Revalidated tag: ${tag}`)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Force refresh completed",
        revalidatedPaths: paths,
        revalidatedTags: tags,
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
    console.error("Error during force refresh:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to force refresh" },
      { status: 500 },
    )
  }
}
