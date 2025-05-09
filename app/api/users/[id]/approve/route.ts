import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { approveUser, getUserById } from "@/lib/db/users"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Check if user exists
    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Approve the user
    const success = await approveUser(userId)

    if (!success) {
      return NextResponse.json({ error: "Failed to approve user" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "User approved successfully" })
  } catch (error) {
    console.error("Error approving user:", error)
    return NextResponse.json(
      { error: "Failed to approve user", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
