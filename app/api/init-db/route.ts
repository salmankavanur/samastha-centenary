import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { COLLECTIONS } from "@/lib/db/models"

export async function GET(request: Request) {
  try {
    // Get the MongoDB URI from environment variables
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set")
    }

    // Extract database name from the connection string
    const dbNameMatch = uri.match(/\/([^/?]+)(\?|$)/)
    const dbName = dbNameMatch ? dbNameMatch[1] : "suhba-archive"

    console.log(`Attempting to initialize database: ${dbName}`)

    // Connect to MongoDB
    const client = new MongoClient(uri)
    await client.connect()
    console.log("Connected to MongoDB")

    // Create database if it doesn't exist (by using it)
    const db = client.db(dbName)
    console.log(`Using database: ${db.databaseName}`)

    // Create collections if they don't exist
    const existingCollections = await db.listCollections().toArray()
    const existingCollectionNames = existingCollections.map((c) => c.name)

    const createdCollections = []

    for (const collection of Object.values(COLLECTIONS)) {
      if (!existingCollectionNames.includes(collection)) {
        await db.createCollection(collection)
        createdCollections.push(collection)
        console.log(`Created collection: ${collection}`)
      }
    }

    // Create indexes
    await db.collection(COLLECTIONS.STATUS_POSTS).createIndex({ day: 1 }, { unique: true })
    await db.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true })
    await db.collection(COLLECTIONS.CONTRIBUTIONS).createIndex({ userId: 1 })
    await db.collection(COLLECTIONS.CONTRIBUTIONS).createIndex({ status: 1 })
    console.log("Created indexes")

    // Create a test admin user if users collection is empty
    const usersCount = await db.collection(COLLECTIONS.USERS).countDocuments()
    if (usersCount === 0) {
      const adminSecretKey = process.env.ADMIN_SECRET_KEY
      if (!adminSecretKey) {
        console.log("ADMIN_SECRET_KEY not set, skipping admin user creation")
      } else {
        console.log("Creating test admin user")
        // This would normally be done through the proper API with password hashing
        // This is just for testing purposes
        await db.collection(COLLECTIONS.USERS).insertOne({
          name: "Test Admin",
          email: "admin@example.com",
          passwordHash: "$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm", // "password"
          role: "admin",
          isApproved: true,
          contributionsCount: 0,
          joinedAt: new Date(),
        })
        console.log("Created test admin user: admin@example.com / password")
      }
    }

    // Close the connection
    await client.close()
    console.log("Closed MongoDB connection")

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      databaseName: dbName,
      createdCollections,
      testAdmin: usersCount === 0 ? "admin@example.com / password" : "No test admin created (users exist)",
    })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to initialize database",
      },
      { status: 500 },
    )
  }
}
