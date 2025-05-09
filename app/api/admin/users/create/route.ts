import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { createUser } from "@/lib/db/users"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate role
    if (!["admin", "contributor"].includes(data.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Create the user
    const user = await createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      avatarUrl: data.avatarUrl || null,
      badge: data.badge || null,
    })

    // Remove sensitive data before returning
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: `User created successfully as ${data.role}.`,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      {
        error: "Failed to create user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
