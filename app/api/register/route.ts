import { NextResponse } from "next/server"
import { createUser } from "@/lib/db/users"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the user
    const user = await createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "contributor", // All registrations are contributors by default
      avatarUrl: null,
      badge: null,
    })

    // Remove sensitive data before returning
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "Registration successful. Your account is pending approval.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json(
      {
        error: "Failed to register user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
