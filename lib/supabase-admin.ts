import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase admin environment variables")
}

// Create a Supabase client with the service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl || "", supabaseServiceKey || "", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

/**
 * Upload a file to Supabase Storage using admin privileges
 */
export async function adminUploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  console.log(`Admin uploading file to ${bucket}/${path}`, { fileSize: file.size, fileType: file.type })

  try {
    // Ensure the bucket exists using admin privileges
    try {
      const { data: bucketData, error: getBucketError } = await supabaseAdmin.storage.getBucket(bucket)

      if (getBucketError) {
        console.log(`Bucket ${bucket} doesn't exist, creating with admin privileges...`)
        const { data: createData, error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        })

        if (createError) {
          console.error(`Failed to create bucket ${bucket} with admin:`, createError)
          return null
        }

        console.log(`Created bucket ${bucket} with admin privileges`)
      } else {
        console.log(`Bucket ${bucket} exists`)
      }
    } catch (bucketError) {
      console.error(`Error checking/creating bucket ${bucket}:`, bucketError)
      return null
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload the file using admin privileges
    console.log(`Uploading file to ${bucket}/${path} with admin privileges...`)
    const { data, error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    })

    if (error) {
      console.error(`Error uploading file to ${bucket}/${path}:`, error)
      return null
    }

    console.log(`File uploaded successfully to ${bucket}/${data.path}`)

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path)
    console.log(`Public URL: ${urlData.publicUrl}`)

    // Add a cache-busting parameter to the URL
    const timestamp = new Date().getTime()
    const imageUrl = `${urlData.publicUrl}?_=${timestamp}`

    return imageUrl
  } catch (error) {
    console.error("Error in adminUploadFile:", error)
    return null
  }
}
