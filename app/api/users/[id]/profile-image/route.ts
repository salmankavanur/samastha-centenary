import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUserById, updateUser } from "@/lib/db/users"
import { supabase } from "@/lib/supabase"

// Define storage bucket name
const AVATARS_BUCKET = "avatars"

// Helper to ensure the avatars bucket exists
async function ensureBucketExists() {
  const { data: buckets } = await supabase.storage.listBuckets()

  if (!buckets?.find((bucket) => bucket.name === AVATARS_BUCKET)) {
    await supabase.storage.createBucket(AVATARS_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    // Ensure the avatars bucket exists
    await ensureBucketExists()

    // Delete old avatar if exists
    if (user.avatarUrl) {
      try {
        const url = new URL(user.avatarUrl)
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/avatars\/(.+)/)

        if (pathMatch && pathMatch[1]) {
          const filePath = decodeURIComponent(pathMatch[1])
          await supabase.storage.from(AVATARS_BUCKET).remove([filePath])
        }
      } catch (error) {
        console.error("Error removing old avatar:", error)
        // Continue even if old avatar removal fails
      }
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${params.id}-${Date.now()}.${fileExt}`
    const filePath = `${params.id}/${fileName}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase
    const { data, error } = await supabase.storage.from(AVATARS_BUCKET).upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

    if (error) {
      console.error("Supabase storage error:", error)
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(filePath)

    // Update user profile
    const updated = await updateUser(params.id, { avatarUrl: publicUrl })

    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile image" }, { status: 500 })
    }

    return NextResponse.json({ success: true, imageUrl: publicUrl })
  } catch (error) {
    console.error("Error updating profile image:", error)
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

    // Check if user is updating their own profile or is an admin
    if (session.user.id !== params.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await getUserById(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete avatar from Supabase if exists
    if (user.avatarUrl) {
      try {
        const url = new URL(user.avatarUrl)
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/avatars\/(.+)/)

        if (pathMatch && pathMatch[1]) {
          const filePath = decodeURIComponent(pathMatch[1])
          await supabase.storage.from(AVATARS_BUCKET).remove([filePath])
        }
      } catch (error) {
        console.error("Error removing avatar from storage:", error)
        // Continue even if storage removal fails
      }
    }

    // Update user profile
    const updated = await updateUser(params.id, { avatarUrl: null })

    if (!updated) {
      return NextResponse.json({ error: "Failed to remove profile image" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing profile image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
