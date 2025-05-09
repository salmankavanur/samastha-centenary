import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/db/models"

export async function GET() {
  try {
    // Test MongoDB connection
    const client = await clientPromise
    const db = client.db()

    // Get list of collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Check if our collections exist
    const missingCollections = Object.values(COLLECTIONS).filter((collection) => !collectionNames.includes(collection))

    // Get count of documents in each collection
    const stats = {}
    for (const collection of Object.values(COLLECTIONS)) {
      if (collectionNames.includes(collection)) {
        stats[collection] = await db.collection(collection).countDocuments()
      } else {
        stats[collection] = "Collection does not exist"
      }
    }

    return NextResponse.json({
      connected: true,
      database: db.databaseName,
      collections: collectionNames,
      missingCollections,
      stats,
      message: "MongoDB connection successful",
    })
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to connect to MongoDB",
      },
      { status: 500 },
    )
  }
}
