import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    // Test MongoDB connection
    const client = await clientPromise

    // Get the database name from the connection string
    const uri = process.env.MONGODB_URI || ""
    const dbNameMatch = uri.match(/\/([^/?]+)(\?|$)/)
    const expectedDbName = dbNameMatch ? dbNameMatch[1] : "unknown"

    // Get actual database name
    const db = client.db()
    const actualDbName = db.databaseName

    // List all databases in the cluster
    const adminDb = client.db("admin")
    const dbs = await adminDb.admin().listDatabases()
    const dbList = dbs.databases.map((db) => db.name)

    // Get list of collections in the current database
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    return NextResponse.json({
      connected: true,
      expectedDatabaseName: expectedDbName,
      actualDatabaseName: actualDbName,
      allDatabases: dbList,
      collections: collectionNames,
      connectionString: uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, "mongodb+srv://****:****@"),
      message: "MongoDB connection details",
    })
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to connect to MongoDB",
      },
      { status: 500 },
    )
  }
}
