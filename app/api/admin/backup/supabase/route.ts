import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize backup data object
    const backupData: Record<string, any> = {}
    let totalFiles = 0
    let totalSize = 0

    console.log("Starting Supabase backup process...")

    // Get all buckets first
    const { data: bucketList, error: bucketError } = await supabase.storage.listBuckets()

    if (bucketError) {
      console.error("Error listing buckets:", bucketError)
      return NextResponse.json({ error: "Failed to list Supabase buckets" }, { status: 500 })
    }

    console.log(`Found ${bucketList.length} buckets`)

    // Process each bucket
    for (const bucket of bucketList) {
      const bucketName = bucket.name
      console.log(`Processing bucket: ${bucketName}`)

      try {
        // List all files in the bucket
        const { data: files, error } = await supabase.storage.from(bucketName).list()

        if (error) {
          console.error(`Error listing files in bucket ${bucketName}:`, error)
          continue
        }

        console.log(`Found ${files?.length || 0} items in bucket ${bucketName}`)

        // Initialize bucket array in backup data
        backupData[bucketName] = []

        // For each file, get its data
        if (files && files.length > 0) {
          for (const file of files) {
            // Skip folders
            if (file.id === null || file.name.endsWith("/")) {
              console.log(`Skipping folder or invalid item: ${file.name}`)
              continue
            }

            console.log(`Processing file: ${bucketName}/${file.name}`)

            try {
              // Get file metadata
              const { data: fileMetadata } = await supabase.storage.from(bucketName).getPublicUrl(file.name)

              // Download the actual file content
              const { data: fileData, error: fileError } = await supabase.storage.from(bucketName).download(file.name)

              if (fileError) {
                console.error(`Error downloading file ${file.name}:`, fileError)
                continue
              }

              if (!fileData) {
                console.error(`No data returned for file ${file.name}`)
                continue
              }

              console.log(`Successfully downloaded file: ${file.name} (${fileData.size} bytes)`)

              // Convert file to base64
              const base64 = await fileToBase64(fileData)

              // Add to backup data with complete information
              backupData[bucketName].push({
                name: file.name,
                path: file.name,
                data: base64,
                publicUrl: fileMetadata.publicUrl,
                metadata: {
                  contentType: fileData.type,
                  size: fileData.size,
                  lastModified: fileData.lastModified,
                  id: file.id,
                  createdAt: file.created_at,
                  updatedAt: file.updated_at,
                  mimeType: fileData.type,
                },
              })

              totalFiles++
              totalSize += fileData.size
              console.log(`Added file to backup: ${bucketName}/${file.name} (${formatBytes(fileData.size)})`)
            } catch (error) {
              console.error(`Error processing file ${file.name}:`, error)
            }
          }
        } else {
          console.log(`No files found in bucket ${bucketName}`)
        }
      } catch (bucketError) {
        console.error(`Error processing bucket ${bucketName}:`, bucketError)
      }
    }

    // Add backup metadata
    backupData.metadata = {
      version: "2.0",
      timestamp: new Date().toISOString(),
      buckets: Object.keys(backupData).filter((key) => key !== "metadata"),
      totalFiles,
      totalSize,
      formattedSize: formatBytes(totalSize),
    }

    console.log(`Backup complete: ${totalFiles} files, ${formatBytes(totalSize)} total`)

    return NextResponse.json(backupData)
  } catch (error) {
    console.error("Error creating Supabase backup:", error)
    return NextResponse.json({ error: "Failed to create Supabase backup" }, { status: 500 })
  }
}

// Helper function to convert a file to base64
async function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
