import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {
  getContributionById,
  approveContribution,
  rejectContribution,
  updateContribution,
  deleteContribution,
} from "@/lib/db/contributions"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const contribution = await getContributionById(params.id)

    if (!contribution) {
      return NextResponse.json({ error: "Contribution not found" }, { status: 404 })
    }

    const data = await request.json()
    const { action } = data

    let result = false

    switch (action) {
      case "approve":
        result = await approveContribution(params.id, session.user.id)
        break
      case "reject":
        result = await rejectContribution(params.id, session.user.id)
        break
      case "update":
        // Update content and source
        result = await updateContribution(params.id, {
          content: data.content,
          source: data.source,
        })
        break
      case "changeStatus":
        // Update status and add review notes
        result = await updateContribution(params.id, {
          status: data.status,
          reviewNotes: data.reviewNotes,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        })
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!result) {
      return NextResponse.json({ error: "Failed to update contribution" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating contribution:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const contribution = await getContributionById(params.id)

    if (!contribution) {
      return NextResponse.json({ error: "Contribution not found" }, { status: 404 })
    }

    const result = await deleteContribution(params.id)

    if (!result) {
      return NextResponse.json({ error: "Failed to delete contribution" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contribution:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
