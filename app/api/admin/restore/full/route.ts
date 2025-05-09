import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { COLLECTIONS } from "@/lib/db/models"
import { STORAGE_BUCKETS } from "@/lib/supabase"

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
    if (!backupData || typeof backupData !== "object" || !backupData.mongodb || !backupData.supabase) {
      return NextResponse.json({ error: "Invalid backup data" }, { status: 400 })
    }

    // Restore MongoDB
    const client = await clientPromise
    const db = client.db()

    // Process each collection
    for (const collectionName of Object.values(COLLECTIONS)) {
      const collectionData = backupData.mongodb[collectionName]

      if (!Array.isArray(collectionData)) {
        console.warn(`Skipping collection ${collectionName}: No data found in backup`)
        continue
      }

      const collection = db.collection(collectionName)

      // Clear existing data
      await collection.deleteMany({})

      // Convert string IDs back to ObjectId
      const documentsToInsert = collectionData.map((doc) => {
        const processed = { ...doc }
        if (processed._id && typeof processed._id === "string") {
          try {
            processed._id = new ObjectId(processed._id)
          } catch (error) {
            console.error(`Invalid ObjectId: ${processed._id}`)
          }
        }
        return processed
      })

      // Insert restored data
      if (documentsToInsert.length > 0) {
        await collection.insertMany(documentsToInsert)
      }
    }

    const results: { supabase?: { success: boolean; error?: string; details?: any } } = {}

    // Restore Supabase data if present
    if (backupData.supabase || Object.keys(backupData).some((key) => Object.values(STORAGE_BUCKETS).includes(key))) {
      try {
        const supabaseResponse = await fetch(new URL("/api/admin/restore/supabase", request.url).toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: request.headers.get("cookie") || "",
          },
          body: JSON.stringify(backupData),
        })

        if (!supabaseResponse.ok) {
          const errorText = await supabaseResponse.text()
          console.error("Error restoring Supabase data:", errorText)
          results.supabase = { success: false, error: errorText }
        } else {
          const supabaseResult = await supabaseResponse.json()
          console.log("Successfully restored Supabase data:", supabaseResult)
          results.supabase = { success: true, details: supabaseResult.results }
        }
      } catch (error) {
        console.error("Error restoring Supabase data:", error)
        results.supabase = { success: false, error: String(error) }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error restoring full backup:", error)
    return NextResponse.json({ error: "Failed to restore full backup" }, { status: 500 })
  }
}

// Helper function to convert base64 to blob
async function base64ToBlob(base64: string, contentType: string): Promise<Blob> {
  // Remove data URL prefix (e.g., "data:image/png;base64,")
  const base64Data = base64.split(",")[1] || base64

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
