import { supabase, STORAGE_BUCKETS } from "./supabase"

/**
 * Initialize storage buckets
 * This function ensures all required storage buckets exist
 */
export async function initializeStorageBuckets() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error("Error listing buckets:", error)
      return false
    }

    const requiredBuckets = Object.values(STORAGE_BUCKETS)

    for (const bucketName of requiredBuckets) {
      const bucketExists = buckets?.some((b) => b.name === bucketName)

      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName}`)
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        })

        if (createError) {
          console.error(`Error creating bucket ${bucketName}:`, createError)
        }
      }
    }

    return true
  } catch (error) {
    console.error("Error initializing storage buckets:", error)
    return false
  }
}

/**
 * Get the file path from a Supabase storage URL
 * @param url The Supabase storage URL
 * @returns The file path within the bucket
 */
export function getFilePathFromUrl(url: string): { bucket: string; path: string } | null {
  try {
    if (!url) return null

    // Extract the path from the URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")

    // The bucket name is typically after /storage/v1/object/public/
    const bucketIndex = pathParts.findIndex((part) => part === "public") + 1
    if (bucketIndex <= 0 || bucketIndex >= pathParts.length) return null

    const bucket = pathParts[bucketIndex]
    const path = pathParts.slice(bucketIndex + 1).join("/")

    return { bucket, path }
  } catch (error) {
    console.error("Error parsing storage URL:", error)
    return null
  }
}

/**
 * Delete a file from Supabase storage using its URL
 * @param url The Supabase storage URL
 * @returns Whether the deletion was successful
 */
export async function deleteFileByUrl(url: string): Promise<boolean> {
  try {
    const fileInfo = getFilePathFromUrl(url)
    if (!fileInfo) return false

    const { bucket, path } = fileInfo
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error("Error deleting file:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting file by URL:", error)
    return false
  }
}
