import { ObjectId } from "mongodb"
import { hash } from "bcryptjs"
import clientPromise from "../mongodb"
import { COLLECTIONS, type User } from "./models"

// Get the database and collection
async function getCollection() {
  const client = await clientPromise
  const db = client.db()
  return db.collection<User>(COLLECTIONS.USERS)
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  const collection = await getCollection()
  return collection.find({}).sort({ joinedAt: -1 }).toArray()
}

/**
 * Get a user by ID
 * @param id User ID
 */
export async function getUserById(id: string | ObjectId): Promise<User | null> {
  try {
    const collection = await getCollection()
    return collection.findOne({
      _id: typeof id === "string" ? new ObjectId(id) : id,
    })
  } catch (error) {
    console.error("Error in getUserById:", error)
    throw error
  }
}

/**
 * Get a user by email
 * @param email User email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const collection = await getCollection()
    return collection.findOne({ email })
  } catch (error) {
    console.error("Error in getUserByEmail:", error)
    throw error
  }
}

/**
 * Create a new user
 * @param user User data
 */
export async function createUser(
  user: Omit<User, "_id" | "joinedAt" | "contributionsCount" | "isApproved" | "passwordHash"> & { password?: string },
): Promise<User> {
  const collection = await getCollection()

  // Check if user already exists
  const existingUser = await getUserByEmail(user.email)
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // Hash password if provided
  let passwordHash = undefined
  if (user.password) {
    passwordHash = await hash(user.password, 10)
  }

  const newUser: User = {
    ...user,
    passwordHash,
    isApproved: user.role === "admin", // Auto-approve admins
    contributionsCount: 0,
    joinedAt: new Date(),
  }

  const result = await collection.insertOne(newUser as any)

  return {
    ...newUser,
    _id: result.insertedId,
  }
}

/**
 * Update a user
 * @param id User ID
 * @param updates Fields to update
 */
export async function updateUser(
  id: string | ObjectId,
  updates: Partial<Omit<User, "_id" | "joinedAt">>,
): Promise<boolean> {
  const collection = await getCollection()

  const result = await collection.updateOne({ _id: typeof id === "string" ? new ObjectId(id) : id }, { $set: updates })

  return result.modifiedCount > 0
}

/**
 * Update a user's badge
 * @param id User ID
 * @param badge New badge value
 */
export async function updateUserBadge(id: string | ObjectId, badge: User["badge"]): Promise<boolean> {
  return updateUser(id, { badge })
}

/**
 * Approve a user
 * @param id User ID
 */
export async function approveUser(id: string | ObjectId): Promise<boolean> {
  return updateUser(id, { isApproved: true })
}

/**
 * Increment a user's contribution count
 * @param id User ID
 */
export async function incrementUserContributions(id: string | ObjectId): Promise<boolean> {
  const collection = await getCollection()

  const result = await collection.updateOne(
    { _id: typeof id === "string" ? new ObjectId(id) : id },
    { $inc: { contributionsCount: 1 } },
  )

  return result.modifiedCount > 0
}

/**
 * Delete a user
 * @param id User ID
 */
export async function deleteUser(id: string | ObjectId): Promise<boolean> {
  const collection = await getCollection()

  const result = await collection.deleteOne({
    _id: typeof id === "string" ? new ObjectId(id) : id,
  })

  return result.deletedCount > 0
}

/**
 * Change user password
 * @param id User ID
 * @param newPassword New password
 */
export async function changePassword(id: string | ObjectId, newPassword: string): Promise<boolean> {
  const passwordHash = await hash(newPassword, 10)
  return updateUser(id, { passwordHash })
}
