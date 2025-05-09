import { ObjectId } from "mongodb"
import { getCollection } from "../mongodb"
import { COLLECTIONS, type News } from "./models"

// Get all news
export async function getAllNews(
  options: {
    limit?: number
    published?: boolean
    featured?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {},
) {
  const { limit = 100, published, featured, sortBy = "publishedAt", sortOrder = "desc" } = options

  const collection = await getCollection(COLLECTIONS.NEWS)

  const query: any = {}
  if (published !== undefined) query.published = published
  if (featured !== undefined) query.featured = featured

  const sort: any = {}
  sort[sortBy] = sortOrder === "asc" ? 1 : -1

  return collection.find(query).sort(sort).limit(limit).toArray()
}

// Get news by ID
export async function getNewsById(id: string) {
  const collection = await getCollection(COLLECTIONS.NEWS)
  return collection.findOne({ _id: new ObjectId(id) })
}

// Create news
export async function createNews(news: Omit<News, "_id">) {
  const collection = await getCollection(COLLECTIONS.NEWS)
  const result = await collection.insertOne(news as any)
  return { ...news, _id: result.insertedId }
}

// Update news
export async function updateNews(id: string, updates: Partial<News>) {
  const collection = await getCollection(COLLECTIONS.NEWS)
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } })
  return result.modifiedCount > 0
}

// Delete news
export async function deleteNews(id: string) {
  const collection = await getCollection(COLLECTIONS.NEWS)
  const result = await collection.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

// Get featured news
export async function getFeaturedNews(limit = 3) {
  return getAllNews({ limit, published: true, featured: true })
}

// Get recent news
export async function getRecentNews(limit = 5) {
  return getAllNews({ limit, published: true })
}

// Search news
export async function searchNews(query: string, limit = 10) {
  const collection = await getCollection(COLLECTIONS.NEWS)
  return collection
    .find({
      published: true,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { summary: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    })
    .limit(limit)
    .toArray()
}

// Add the missing export
export async function getNews(
  options: {
    limit?: number
    published?: boolean
    featured?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {},
) {
  console.log("Getting news with options:", options)
  return getAllNews(options)
}
