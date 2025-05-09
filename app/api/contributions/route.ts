import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import type { ObjectId } from "mongodb"
import { getAllContributions, getPendingContributions, createContribution } from "@/lib/db/contributions"
import { getUserById } from "@/lib/db/users"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let contributions

    if (status === "pending") {
      contributions = await getPendingContributions()
    } else {
      contributions = await getAllContributions()
    }

    return NextResponse.json(contributions)
  } catch (error) {
    console.error("Error fetching contributions:", error)
    return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if the user is authenticated
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.content || !data.userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists and is approved
    const user = await getUserById(data.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.isApproved && user.role !== "admin") {
      return NextResponse.json({ error: "User not approved to contribute" }, { status: 403 })
    }

    // Create the contribution
    const contribution = await createContribution({
      userId: user._id as ObjectId,
      content: data.content,
      source: data.source || null,
      forDay: data.forDay || null,
    })

    return NextResponse.json(contribution, { status: 201 })
  } catch (error) {
    console.error("Error creating contribution:", error)
    return NextResponse.json({ error: "Failed to create contribution" }, { status: 500 })
  }
}
