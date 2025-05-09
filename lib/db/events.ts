import { ObjectId } from "mongodb"
import { getCollection } from "../mongodb"
import { COLLECTIONS, type Event } from "./models"

// Get all events
export async function getAllEvents(
  options: {
    limit?: number
    published?: boolean
    featured?: boolean
    upcoming?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {},
) {
  const { limit = 100, published, featured, upcoming, sortBy = "startDate", sortOrder = "asc" } = options

  try {
    const collection = await getCollection(COLLECTIONS.EVENTS)

    // Build the query
    const query: any = {}
    if (published !== undefined) query.published = published
    if (featured !== undefined) query.featured = featured

    // For upcoming events, compare with current date
    if (upcoming) {
      query.startDate = { $gte: new Date() }
    }

    console.log("MongoDB query:", JSON.stringify(query))

    // Build the sort
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    const events = await collection.find(query).sort(sort).limit(limit).toArray()
    console.log(`Found ${events.length} events with query:`, query)

    return events
  } catch (error) {
    console.error("Error in getAllEvents:", error)
    throw error
  }
}

// Get event by ID
export async function getEventById(id: string) {
  try {
    const collection = await getCollection(COLLECTIONS.EVENTS)
    const event = await collection.findOne({ _id: new ObjectId(id) })
    console.log("Found event by ID:", id, !!event)
    return event
  } catch (error) {
    console.error(`Error getting event by ID ${id}:`, error)
    throw error
  }
}

// Create event
export async function createEvent(event: Omit<Event, "_id">) {
  try {
    // Ensure dates are properly converted to Date objects
    const processedEvent = {
      ...event,
      startDate: event.startDate instanceof Date ? event.startDate : new Date(event.startDate),
      endDate: event.endDate ? (event.endDate instanceof Date ? event.endDate : new Date(event.endDate)) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const collection = await getCollection(COLLECTIONS.EVENTS)
    const result = await collection.insertOne(processedEvent as any)
    console.log("Created event with ID:", result.insertedId)
    return { ...processedEvent, _id: result.insertedId }
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
  }
}

// Update event
export async function updateEvent(id: string, updates: Partial<Event>) {
  try {
    // Process dates if they're strings
    const processedUpdates = { ...updates }

    if (updates.startDate && typeof updates.startDate === "string") {
      processedUpdates.startDate = new Date(updates.startDate)
    }

    if (updates.endDate && typeof updates.endDate === "string") {
      processedUpdates.endDate = new Date(updates.endDate)
    }

    processedUpdates.updatedAt = new Date()

    const collection = await getCollection(COLLECTIONS.EVENTS)
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: processedUpdates })

    console.log(`Updated event ${id}, modified count:`, result.modifiedCount)
    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error updating event ${id}:`, error)
    throw error
  }
}

// Delete event
export async function deleteEvent(id: string) {
  try {
    const collection = await getCollection(COLLECTIONS.EVENTS)
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    console.log(`Deleted event ${id}, deleted count:`, result.deletedCount)
    return result.deletedCount > 0
  } catch (error) {
    console.error(`Error deleting event ${id}:`, error)
    throw error
  }
}

// Get upcoming events
export async function getUpcomingEvents(limit = 5) {
  return getAllEvents({
    limit,
    published: true,
    upcoming: true,
    sortBy: "startDate",
    sortOrder: "asc",
  })
}

// Get featured events
export async function getFeaturedEvents(limit = 3) {
  return getAllEvents({
    limit,
    published: true,
    featured: true,
    sortBy: "startDate",
    sortOrder: "asc",
  })
}

// Search events
export async function searchEvents(query: string, limit = 10) {
  try {
    const collection = await getCollection(COLLECTIONS.EVENTS)
    const events = await collection
      .find({
        published: true,
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { location: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      })
      .limit(limit)
      .toArray()

    console.log(`Found ${events.length} events matching search query:`, query)
    return events
  } catch (error) {
    console.error(`Error searching events with query ${query}:`, error)
    throw error
  }
}

// Get events (alias for getAllEvents with better logging)
export async function getEvents(
  options: {
    limit?: number
    published?: boolean
    featured?: boolean
    upcoming?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {},
) {
  console.log("Getting events with options:", options)
  try {
    const events = await getAllEvents(options)
    console.log(`Found ${events.length} events`)
    return events
  } catch (error) {
    console.error("Error getting events:", error)
    throw error
  }
}
