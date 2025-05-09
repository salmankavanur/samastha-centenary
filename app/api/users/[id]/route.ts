import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUserById, updateUser, deleteUser } from "@/lib/db/users"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserById(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is updating their own profile or is an admin
    if (session.user.id !== params.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await getUserById(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const data = await request.json()

    // Validate data
    if (data.email && data.email !== user.email) {
      // Check if email is already in use by another user
      // This would require a function to check email availability
      // For now, we'll just update the email
    }

    // Only allow updating certain fields
    const allowedUpdates = {
      name: data.name,
      email: data.email,
      // Add other fields that can be updated here
    }

    // Update user
    const updated = await updateUser(params.id, allowedUpdates)

    if (!updated) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const success = await deleteUser(params.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
