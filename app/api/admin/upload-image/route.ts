import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucketType = formData.get("bucketType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!bucketType || !["news", "events"].includes(bucketType)) {
      return NextResponse.json({ error: "Invalid bucket type" }, { status: 400 })
    }

    // Determine the bucket name
    const bucketName = bucketType === "news" ? "news-images" : "event-images"

    // Convert the file to an array buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Generate a unique file name
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`
    const filePath = `${fileName}`

    console.log(`Uploading file to ${bucketName}/${filePath}`)

    // Upload the file to Supabase Storage
    const { data, error } = await supabaseAdmin.storage.from(bucketName).upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Supabase storage upload error:", error)
      return NextResponse.json({ error: `Failed to upload file: ${error.message}` }, { status: 500 })
    }

    // Get the public URL
    const { data: publicUrlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath)

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: data.path,
      bucket: bucketName,
    })
  } catch (error) {
    console.error("Error in upload-image API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 },
    )
  }
}
