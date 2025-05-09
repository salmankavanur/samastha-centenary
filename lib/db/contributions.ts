import { ObjectId } from "mongodb"
import clientPromise from "../mongodb"
import { COLLECTIONS, type Contribution } from "./models"
import { incrementUserContributions } from "./users"

// Get the database and collection
async function getCollection() {
  const client = await clientPromise
  const db = client.db()
  return db.collection<Contribution>(COLLECTIONS.CONTRIBUTIONS)
}

/**
 * Get all contributions
 */
export async function getAllContributions(): Promise<Contribution[]> {
  const collection = await getCollection()
  return collection.find({}).sort({ createdAt: -1 }).toArray()
}

/**
 * Get a contribution by ID
 * @param id Contribution ID
 */
export async function getContributionById(id: string | ObjectId): Promise<Contribution | null> {
  const collection = await getCollection()
  return collection.findOne({
    _id: typeof id === "string" ? new ObjectId(id) : id,
  })
}

/**
 * Get contributions by user ID
 * @param userId User ID
 */
export async function getContributionsByUserId(userId: string | ObjectId): Promise<Contribution[]> {
  try {
    const collection = await getCollection()
    return collection
      .find({
        userId: typeof userId === "string" ? new ObjectId(userId) : userId,
      })
      .sort({ createdAt: -1 })
      .toArray()
  } catch (error) {
    console.error("Error in getContributionsByUserId:", error)
    return []
  }
}

/**
 * Create a new contribution
 * @param contribution Contribution data
 */
export async function createContribution(
  contribution: Omit<Contribution, "_id" | "createdAt" | "status">,
): Promise<Contribution> {
  const collection = await getCollection()

  const newContribution: Contribution = {
    ...contribution,
    status: "pending",
    createdAt: new Date(),
  }

  const result = await collection.insertOne(newContribution as any)

  return {
    ...newContribution,
    _id: result.insertedId,
  }
}

/**
 * Update a contribution
 * @param id Contribution ID
 * @param updates Fields to update
 */
export async function updateContribution(
  id: string | ObjectId,
  updates: Partial<Omit<Contribution, "_id" | "createdAt">>,
): Promise<boolean> {
  const collection = await getCollection()

  const result = await collection.updateOne(
    { _id: typeof id === "string" ? new ObjectId(id) : id },
    { $set: { ...updates, updatedAt: new Date() } },
  )

  return result.modifiedCount > 0
}

/**
 * Approve a contribution
 * @param id Contribution ID
 * @param reviewerId Reviewer ID
 */
export async function approveContribution(id: string | ObjectId, reviewerId: string | ObjectId): Promise<boolean> {
  const contribution = await getContributionById(id)

  if (!contribution) {
    return false
  }

  // Update contribution status
  const updated = await updateContribution(id, {
    status: "approved",
    reviewedBy: typeof reviewerId === "string" ? new ObjectId(reviewerId) : reviewerId,
    reviewedAt: new Date(),
  })

  if (updated) {
    // Increment user's contribution count
    await incrementUserContributions(contribution.userId)
  }

  return updated
}

/**
 * Reject a contribution
 * @param id Contribution ID
 * @param reviewerId Reviewer ID
 * @param rejectionReason Reason for rejection
 */
export async function rejectContribution(
  id: string | ObjectId,
  reviewerId: string | ObjectId,
  rejectionReason?: string,
): Promise<boolean> {
  return updateContribution(id, {
    status: "rejected",
    reviewedBy: typeof reviewerId === "string" ? new ObjectId(reviewerId) : reviewerId,
    reviewedAt: new Date(),
    rejectionReason,
  })
}

/**
 * Delete a contribution
 * @param id Contribution ID
 */
export async function deleteContribution(id: string | ObjectId): Promise<boolean> {
  const collection = await getCollection()

  const result = await collection.deleteOne({
    _id: typeof id === "string" ? new ObjectId(id) : id,
  })

  return result.deletedCount > 0
}

/**
 * Get pending contributions count
 */
export async function getPendingContributionsCount(): Promise<number> {
  const collection = await getCollection()
  return collection.countDocuments({ status: "pending" })
}

/**
 * Get pending contributions
 */
export async function getPendingContributions(): Promise<Contribution[]> {
  const collection = await getCollection()
  return collection.find({ status: "pending" }).sort({ createdAt: -1 }).toArray()
}
