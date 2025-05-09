import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabase, STORAGE_BUCKETS, initializeStorageBuckets } from "@/lib/supabase"

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get Supabase URL and key (masked for security)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"
    const supabaseKeyMasked = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5)}...${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length - 5,
        )}`
      : "Not set"

    // Initialize buckets
    const initResult = await initializeStorageBuckets()

    // List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    // Check each bucket
    const bucketDetails = []
    for (const bucketName of Object.values(STORAGE_BUCKETS)) {
      try {
        // Get bucket info
        const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket(bucketName)

        // List files in bucket
        const { data: files, error: filesError } = await supabase.storage.from(bucketName).list()

        bucketDetails.push({
          name: bucketName,
          exists: !bucketError,
          isPublic: bucketInfo?.public || false,
          error: bucketError ? bucketError.message : null,
          files: files ? files.map((f) => ({ name: f.name, size: f.metadata?.size || "unknown" })) : [],
          filesError: filesError ? filesError.message : null,
        })
      } catch (error) {
        bucketDetails.push({
          name: bucketName,
          exists: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      supabase: {
        url: supabaseUrl,
        key: supabaseKeyMasked,
        connected: !bucketsError,
      },
      initialization: {
        success: initResult,
      },
      buckets: {
        list: buckets || [],
        error: bucketsError ? bucketsError.message : null,
        details: bucketDetails,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in debug-storage:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
