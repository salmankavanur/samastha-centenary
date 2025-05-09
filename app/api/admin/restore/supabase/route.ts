import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabase, STORAGE_BUCKETS } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get backup data from request
    const backupData = await request.json()

    // Validate backup data
    if (!backupData || typeof backupData !== "object") {
      return NextResponse.json({ error: "Invalid backup data" }, { status: 400 })
    }

    // Check backup version
    const backupVersion = backupData.metadata?.version || "1.0"
    console.log(`Processing backup version: ${backupVersion}`)

    // Track restoration progress
    const restorationResults = {
      success: 0,
      failed: 0,
      skipped: 0,
      buckets: {} as Record<string, { success: number; failed: number; skipped: number }>,
    }

    // Process each bucket
    for (const bucketName of Object.values(STORAGE_BUCKETS)) {
      const bucketFiles = backupData[bucketName]
      restorationResults.buckets[bucketName] = { success: 0, failed: 0, skipped: 0 }

      if (!Array.isArray(bucketFiles)) {
        console.warn(`Skipping bucket ${bucketName}: No files found in backup`)
        continue
      }

      // Ensure bucket exists
      try {
        const { data: bucketExists } = await supabase.storage.getBucket(bucketName)

        if (!bucketExists) {
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
          })

          if (createError) {
            console.error(`Error creating bucket ${bucketName}:`, createError)
            continue
          }
          console.log(`Created bucket: ${bucketName}`)
        }
      } catch (error) {
        console.error(`Error checking/creating bucket ${bucketName}:`, error)
        continue
      }

      // Process each file in the bucket
      for (const file of bucketFiles) {
        try {
          if (!file.data || !file.name) {
            console.warn(`Skipping file with missing data or name in bucket ${bucketName}`)
            restorationResults.skipped++
            restorationResults.buckets[bucketName].skipped++
            continue
          }

          // Convert base64 to blob
          const blob = await base64ToBlob(
            file.data,
            file.metadata?.contentType || file.metadata?.mimeType || "application/octet-stream",
          )

          // Upload file to Supabase
          const { error: uploadError } = await supabase.storage.from(bucketName).upload(file.name, blob, {
            upsert: true,
            contentType: file.metadata?.contentType || file.metadata?.mimeType,
          })

          if (uploadError) {
            console.error(`Error uploading file ${file.name}:`, uploadError)
            restorationResults.failed++
            restorationResults.buckets[bucketName].failed++
          } else {
            console.log(`Restored file: ${bucketName}/${file.name} (${formatBytes(blob.size)})`)
            restorationResults.success++
            restorationResults.buckets[bucketName].success++
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
          restorationResults.failed++
          restorationResults.buckets[bucketName].failed++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Supabase backup restored successfully",
      results: restorationResults,
    })
  } catch (error) {
    console.error("Error restoring Supabase backup:", error)
    return NextResponse.json({ error: "Failed to restore Supabase backup" }, { status: 500 })
  }
}

// Helper function to convert base64 to blob
async function base64ToBlob(base64: string, contentType: string): Promise<Blob> {
  // Remove data URL prefix (e.g., "data:image/png;base64,")
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64

  const byteCharacters = atob(base64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: contentType })
}

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
