import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get environment variables (redacted for security)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return NextResponse.json({
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 5)}...` : undefined,
        hasUrl: !!supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in debug-supabase route:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
