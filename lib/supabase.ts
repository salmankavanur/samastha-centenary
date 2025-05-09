import { createClient } from "@supabase/supabase-js"

// Define storage bucket names
export const STORAGE_BUCKETS = {
  NEWS_IMAGES: "news-images",
  EVENT_IMAGES: "event-images",
  AVATARS: "avatars",
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
}

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: false,
  },
})

/**
 * Upload a file to Supabase Storage
 * @param bucket The storage bucket name
 * @param path The file path in the bucket
 * @param file The file to upload
 * @returns The file URL or null if upload failed
 */
export async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  console.log(`Uploading file to ${bucket}/${path}`, { fileSize: file.size, fileType: file.type })

  try {
    // Ensure the bucket exists
    try {
      const { data: bucketData, error: getBucketError } = await supabase.storage.getBucket(bucket)

      if (getBucketError) {
        console.log(`Bucket ${bucket} doesn't exist, creating...`)
        const { data: createData, error: createError } = await supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        })

        if (createError) {
          console.error(`Failed to create bucket ${bucket}:`, createError)
          return null
        }

        console.log(`Created bucket ${bucket}`)
      } else {
        console.log(`Bucket ${bucket} exists`)
      }
    } catch (bucketError) {
      console.error(`Error checking/creating bucket ${bucket}:`, bucketError)
      return null
    }

    // Upload the file
    console.log(`Uploading file to ${bucket}/${path}...`)
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error(`Error uploading file to ${bucket}/${path}:`, error)
      return null
    }

    console.log(`File uploaded successfully to ${bucket}/${data.path}`)

    // Get the public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
    console.log(`Public URL: ${urlData.publicUrl}`)

    return urlData.publicUrl
  } catch (error) {
    console.error("Error in uploadFile:", error)
    return null
  }
}

/**
 * Delete a file from Supabase Storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @returns Whether the deletion was successful
 */
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error("Error deleting file:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteFile:", error)
    return false
  }
}

/**
 * Initialize all storage buckets
 */
export async function initializeStorageBuckets(): Promise<boolean> {
  console.log("Initializing storage buckets...")

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return false
    }

    const existingBuckets = buckets?.map((b) => b.name) || []
    console.log("Existing buckets:", existingBuckets)

    for (const bucketName of Object.values(STORAGE_BUCKETS)) {
      if (!existingBuckets.includes(bucketName)) {
        console.log(`Creating bucket: ${bucketName}`)
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        })

        if (createError) {
          console.error(`Error creating bucket ${bucketName}:`, createError)
        } else {
          console.log(`Successfully created bucket: ${bucketName}`)
        }
      } else {
        console.log(`Bucket already exists: ${bucketName}`)

        // Update bucket to ensure it's public
        const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        })

        if (updateError) {
          console.error(`Error updating bucket ${bucketName}:`, updateError)
        }
      }
    }

    return true
  } catch (error) {
    console.error("Error initializing storage buckets:", error)
    return false
  }
}
