import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabase, STORAGE_BUCKETS } from "@/lib/supabase"

export const dynamic = "force-dynamic"

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

    if (!bucketType || (bucketType !== "news" && bucketType !== "events")) {
      return NextResponse.json({ error: "Invalid bucket type" }, { status: 400 })
    }

    // Determine the bucket name
    const bucketName = bucketType === "news" ? STORAGE_BUCKETS.NEWS_IMAGES : STORAGE_BUCKETS.EVENT_IMAGES

    // Generate a unique file path
    const timestamp = new Date().getTime()
    const randomString = Math.random().toString(36).substring(2, 10)
    const fileName = `${timestamp}-${randomString}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    console.log(`Uploading file to ${bucketName}/${fileName}`, { fileSize: file.size, fileType: file.type })

    // Ensure the bucket exists
    try {
      const { data: bucketData, error: getBucketError } = await supabase.storage.getBucket(bucketName)

      if (getBucketError) {
        console.log(`Bucket ${bucketName} doesn't exist, creating...`)
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        })

        if (createError) {
          console.error(`Failed to create bucket ${bucketName}:`, createError)
          return NextResponse.json(
            { error: `Failed to create storage bucket: ${createError.message}` },
            { status: 500 },
          )
        }

        console.log(`Created bucket ${bucketName}`)
      } else {
        console.log(`Bucket ${bucketName} exists`)
      }
    } catch (bucketError) {
      console.error(`Error checking/creating bucket ${bucketName}:`, bucketError)
      return NextResponse.json(
        {
          error: `Error checking/creating storage bucket: ${bucketError instanceof Error ? bucketError.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase
    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, buffer, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    })

    if (error) {
      console.error(`Error uploading file to ${bucketName}/${fileName}:`, error)
      return NextResponse.json({ error: `Failed to upload file: ${error.message}` }, { status: 500 })
    }

    console.log(`File uploaded successfully to ${bucketName}/${data.path}`)

    // Get the public URL
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data.path)
    console.log(`Public URL: ${urlData.publicUrl}`)

    // Add a cache-busting parameter to the URL
    const imageUrl = `${urlData.publicUrl}?_=${timestamp}`

    return NextResponse.json(
      {
        success: true,
        imageUrl,
        originalUrl: urlData.publicUrl,
        bucket: bucketName,
        path: data.path,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Error in upload-image API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error during upload" },
      { status: 500 },
    )
  }
}
