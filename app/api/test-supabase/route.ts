import { NextResponse } from "next/server"
import { supabase, STORAGE_BUCKETS } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Testing Supabase connection...")

    // Test connection by listing buckets
    let isConnected = false
    try {
      const { data, error } = await supabase.storage.listBuckets()

      if (!error) {
        isConnected = true
        console.log("Successfully connected to Supabase")

        // Get existing bucket names
        const existingBuckets = data?.map((bucket) => bucket.name) || []
        console.log("Existing buckets:", existingBuckets)

        // Check which buckets from our constants are missing
        const expectedBuckets = Object.values(STORAGE_BUCKETS)
        const missingBuckets = expectedBuckets.filter((bucket) => !existingBuckets.includes(bucket))

        // Get file counts for each bucket
        const fileCounts = {}

        for (const bucket of existingBuckets) {
          try {
            console.log(`Listing files in bucket: ${bucket}`)
            const { data: files, error: filesError } = await supabase.storage.from(bucket).list()

            if (!filesError && files) {
              fileCounts[bucket] = files.filter((file) => !file.name.endsWith("/")).length
              console.log(`Bucket ${bucket} has ${fileCounts[bucket]} files`)
            } else {
              console.error(`Error listing files in bucket ${bucket}:`, filesError)
              fileCounts[bucket] = 0
            }
          } catch (error) {
            console.error(`Error processing bucket ${bucket}:`, error)
            fileCounts[bucket] = 0
          }
        }

        return NextResponse.json({
          connected: true,
          buckets: existingBuckets,
          missingBuckets,
          fileCounts,
          message: "Supabase connection successful",
        })
      } else {
        console.error("Error listing buckets:", error)
        return NextResponse.json({
          connected: false,
          error: error.message,
          message: "Failed to list Supabase buckets",
        })
      }
    } catch (error) {
      console.error("Error connecting to Supabase:", error)
      return NextResponse.json({
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to connect to Supabase",
      })
    }
  } catch (error) {
    console.error("Unexpected error testing Supabase connection:", error)
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
        message: "Failed to connect to Supabase due to an unexpected error",
      },
      { status: 500 },
    )
  }
}
