import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/db/models"

export async function GET(request: Request) {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize backup data object
    const backupData: Record<string, any> = {
      mongodb: {},
      supabase: {},
    }

    // Backup MongoDB
    const client = await clientPromise
    const db = client.db()

    // Get all collections
    for (const collectionName of Object.values(COLLECTIONS)) {
      const collection = db.collection(collectionName)
      const documents = await collection.find({}).toArray()

      // Convert ObjectId to string for JSON serialization
      const serializedDocuments = documents.map((doc) => {
        const serialized = { ...doc }
        if (serialized._id) {
          serialized._id = serialized._id.toString()
        }
        return serialized
      })

      backupData.mongodb[collectionName] = serializedDocuments
    }

    // Get Supabase storage data
    let supabaseData = {}
    try {
      const supabaseResponse = await fetch(new URL("/api/admin/backup/supabase", request.url).toString(), {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      })

      if (!supabaseResponse.ok) {
        console.error("Error fetching Supabase data:", await supabaseResponse.text())
      } else {
        supabaseData = await supabaseResponse.json()
        console.log("Successfully fetched Supabase data")
      }
    } catch (error) {
      console.error("Error fetching Supabase data:", error)
    }

    backupData.supabase = supabaseData

    return NextResponse.json(backupData)
  } catch (error) {
    console.error("Error creating full backup:", error)
    return NextResponse.json({ error: "Failed to create full backup" }, { status: 500 })
  }
}

// Helper function to convert a file to base64
async function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
