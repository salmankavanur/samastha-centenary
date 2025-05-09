import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/db/models"
import { supabase, STORAGE_BUCKETS } from "@/lib/supabase"

export async function GET() {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Starting system initialization...")

    // Initialize MongoDB collections
    const client = await clientPromise
    const db = client.db()

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    const createdCollections = []
    for (const collection of Object.values(COLLECTIONS)) {
      if (!collectionNames.includes(collection)) {
        await db.createCollection(collection)
        createdCollections.push(collection)
        console.log(`Created MongoDB collection: ${collection}`)
      }
    }

    // Create indexes
    await db.collection(COLLECTIONS.STATUS_POSTS).createIndex({ day: 1 }, { unique: true })
    await db.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true })
    await db.collection(COLLECTIONS.CONTRIBUTIONS).createIndex({ userId: 1 })
    await db.collection(COLLECTIONS.CONTRIBUTIONS).createIndex({ status: 1 })
    console.log("MongoDB indexes created successfully")

    // Initialize Supabase storage buckets
    console.log("Initializing Supabase storage buckets...")

    // List existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing Supabase buckets:", listError)
      return NextResponse.json({
        success: true,
        mongodb: { createdCollections },
        supabase: { error: listError.message },
      })
    }

    const existingBucketNames = existingBuckets.map((b) => b.name)
    console.log("Existing buckets:", existingBucketNames)

    // Create missing buckets
    const createdBuckets = []
    for (const bucketName of Object.values(STORAGE_BUCKETS)) {
      if (!existingBucketNames.includes(bucketName)) {
        try {
          console.log(`Creating bucket: ${bucketName}`)
          const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
          })

          if (error) {
            console.error(`Error creating bucket ${bucketName}:`, error)
          } else {
            createdBuckets.push(bucketName)
            console.log(`Created Supabase bucket: ${bucketName}`)
          }
        } catch (error) {
          console.error(`Error creating bucket ${bucketName}:`, error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database and storage initialized successfully",
      mongodb: {
        createdCollections,
      },
      supabase: {
        createdBuckets,
      },
    })
  } catch (error) {
    console.error("Error initializing database and storage:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize database and storage",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
