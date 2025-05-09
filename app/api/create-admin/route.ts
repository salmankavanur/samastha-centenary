import { NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/db/users"

// This is a one-time setup endpoint to create the initial admin user
// It should be disabled or protected in production
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.secretKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the secret key matches (this is a simple protection mechanism)
    // In production, you would use a more secure approach
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY || "your-secret-key-here"
    if (data.secretKey !== expectedSecretKey) {
      return NextResponse.json({ error: "Invalid secret key" }, { status: 401 })
    }

    // Check if admin already exists
    const existingUser = await getUserByEmail(data.email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create the admin user
    const user = await createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "admin", // Set role as admin
    })

    // Remove sensitive data before returning
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "Admin user created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      {
        error: "Failed to create admin user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
