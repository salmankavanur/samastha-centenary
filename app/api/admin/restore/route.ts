import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/db/models"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get backup data from request
    const backupData = await request.json()

    // Validate backup data
    if (!backupData.metadata || !backupData.data) {
      return NextResponse.json({ error: "Invalid backup format" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Restore each collection
    for (const collectionName of Object.keys(backupData.data)) {
      if (!Object.values(COLLECTIONS).includes(collectionName as any)) {
        continue // Skip unknown collections
      }

      const collection = db.collection(collectionName)

      // Convert string IDs back to ObjectIds
      const documents = backupData.data[collectionName].map((doc: any) => {
        if (doc._id && typeof doc._id === "string") {
          return { ...doc, _id: new ObjectId(doc._id) }
        }
        return doc
      })

      // Drop existing collection and insert new data
      if (documents.length > 0) {
        await collection.deleteMany({})
        await collection.insertMany(documents)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Backup restored successfully",
      collectionsRestored: Object.keys(backupData.data).length,
    })
  } catch (error) {
    console.error("Error restoring backup:", error)
    return NextResponse.json(
      {
        error: "Failed to restore backup",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
