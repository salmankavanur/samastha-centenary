import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/db/models"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Get data from collections
    const statusPosts = await db.collection(COLLECTIONS.STATUS_POSTS).find({}).toArray()
    const users = await db.collection(COLLECTIONS.USERS).find({}).toArray()
    const contributions = await db.collection(COLLECTIONS.CONTRIBUTIONS).find({}).toArray()

    // Create backup object
    const backup = {
      metadata: {
        version: "1.0",
        timestamp: new Date().toISOString(),
        collections: [COLLECTIONS.STATUS_POSTS, COLLECTIONS.USERS, COLLECTIONS.CONTRIBUTIONS],
      },
      data: {
        [COLLECTIONS.STATUS_POSTS]: statusPosts,
        [COLLECTIONS.USERS]: users,
        [COLLECTIONS.CONTRIBUTIONS]: contributions,
      },
    }

    return NextResponse.json(backup)
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 })
  }
}
