import { ObjectId } from "mongodb"
import clientPromise from "../mongodb"
import { COLLECTIONS, type StatusPost } from "./models"
import { revalidatePath } from "next/cache"
import { calculateCurrentDayNumber } from "../date-utils"

// Get the database and collection
async function getCollection() {
  const client = await clientPromise
  const db = client.db()
  return db.collection<StatusPost>(COLLECTIONS.STATUS_POSTS)
}

/**
 * Get all status posts
 */
export async function getAllStatusPosts(): Promise<StatusPost[]> {
  try {
    console.log("Attempting to get all status posts from database")
    const collection = await getCollection()
    const posts = await collection.find({}).sort({ day: -1 }).toArray()
    console.log(`Retrieved ${posts.length} posts from database`)
    return posts
  } catch (error) {
    console.error("Error fetching status posts:", error)
    console.log("Returning empty array due to database error")
    return []
  }
}

/**
 * Get recent status posts
 * @param limit Number of posts to return
 */
export async function getRecentStatusPosts(limit = 7): Promise<StatusPost[]> {
  try {
    console.log(`Attempting to get ${limit} recent status posts from database`)
    const collection = await getCollection()
    const posts = await collection.find({ isPublished: true }).sort({ day: -1 }).limit(limit).toArray()
    console.log(`Retrieved ${posts.length} recent posts from database`)
    return posts
  } catch (error) {
    console.error("Error fetching recent status posts:", error)
    console.log("Returning empty array due to database error")
    return []
  }
}

/**
 * Get a status post by day number
 * @param day Day number
 */
export async function getStatusPostByDay(day: number): Promise<StatusPost | null> {
  const collection = await getCollection()
  return collection.findOne({ day })
}

/**
 * Create a new status post
 * @param post Status post data
 */
export async function createStatusPost(post: Omit<StatusPost, "_id" | "createdAt">): Promise<StatusPost> {
  const collection = await getCollection()

  const newPost: StatusPost = {
    ...post,
    createdAt: new Date(),
  }

  const result = await collection.insertOne(newPost as any)

  // Revalidate paths after creating a new post
  revalidatePath("/")
  revalidatePath("/calendar")
  revalidatePath(`/status/${post.day}`)

  return {
    ...newPost,
    _id: result.insertedId,
  }
}

/**
 * Update a status post
 * @param id Status post ID
 * @param updates Fields to update
 */
export async function updateStatusPost(
  id: string | ObjectId,
  updates: Partial<Omit<StatusPost, "_id" | "createdAt">>,
): Promise<boolean> {
  const collection = await getCollection()

  const result = await collection.updateOne(
    { _id: typeof id === "string" ? new ObjectId(id) : id },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    },
  )

  // Get the updated post to revalidate its specific page
  const updatedPost = await collection.findOne({ _id: typeof id === "string" ? new ObjectId(id) : id })

  // Revalidate paths after updating a post
  revalidatePath("/")
  revalidatePath("/calendar")
  if (updatedPost) {
    revalidatePath(`/status/${updatedPost.day}`)
  }

  return result.modifiedCount > 0
}

/**
 * Delete a status post
 * @param id Status post ID
 */
export async function deleteStatusPost(id: string | ObjectId): Promise<boolean> {
  const collection = await getCollection()

  // Get the post before deleting to revalidate its specific page
  const postToDelete = await collection.findOne({ _id: typeof id === "string" ? new ObjectId(id) : id })

  const result = await collection.deleteOne({
    _id: typeof id === "string" ? new ObjectId(id) : id,
  })

  // Revalidate paths after deleting a post
  revalidatePath("/")
  revalidatePath("/calendar")
  if (postToDelete) {
    revalidatePath(`/status/${postToDelete.day}`)
  }

  return result.deletedCount > 0
}

/**
 * Get the current day number based on the countdown start date
 * @returns The current day number (between 1 and 300)
 */
export async function getCurrentDayNumber(): Promise<number> {
  try {
    return calculateCurrentDayNumber()
  } catch (error) {
    console.error("Error calculating current day number:", error)
    return 1 // Default to day 1 if there's an error
  }
}

/**
 * Get today's status post with cache busting
 * @returns The status post for today or the most recent published post
 */
export async function getTodayStatusPost(): Promise<StatusPost | null> {
  try {
    const currentDay = calculateCurrentDayNumber()

    const collection = await getCollection()

    // First try to find the exact post for today
    const exactPost = await collection.findOne({ day: currentDay, isPublished: true })
    if (exactPost) return exactPost

    // If no exact match, find the closest published post with day <= currentDay
    const closestPost = await collection
      .find({
        day: { $lte: currentDay },
        isPublished: true,
      })
      .sort({ day: -1 })
      .limit(1)
      .toArray()

    return closestPost.length > 0 ? closestPost[0] : null
  } catch (error) {
    console.error("Error fetching today's status post:", error)
    return null
  }
}
