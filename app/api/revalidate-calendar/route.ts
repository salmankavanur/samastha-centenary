import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest) {
  try {
    // Revalidate the calendar page
    revalidatePath("/calendar")
    revalidatePath("/")

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: "Calendar revalidated successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        revalidated: false,
        now: Date.now(),
        message: "Error revalidating calendar",
      },
      { status: 500 },
    )
  }
}
