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

    // Get counts from collections
    const totalPosts = await db.collection(COLLECTIONS.STATUS_POSTS).countDocuments()
    const pendingContributions = await db.collection(COLLECTIONS.CONTRIBUTIONS).countDocuments({ status: "pending" })
    const totalUsers = await db.collection(COLLECTIONS.USERS).countDocuments()

    // Get active users (users who have logged in within the last 7 days)
    // This is a placeholder - in a real app, you'd track user sessions
    const activeUsers = Math.floor(totalUsers * 0.7) // Assuming 70% of users are active

    return NextResponse.json({
      totalPosts,
      pendingContributions,
      totalUsers,
      activeUsers,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
