import { NextResponse } from "next/server"
import { getAllUsers, createUser } from "@/lib/db/users"

export async function GET() {
  try {
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the user
    const user = await createUser({
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl || null,
      role: data.role,
      badge: data.badge || null,
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
