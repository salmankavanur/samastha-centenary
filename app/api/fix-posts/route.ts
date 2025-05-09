import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getDayNumberForDate } from "@/lib/date-utils"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get all status posts
    const posts = await db.collection("status_posts").find({}).toArray()

    // Update each post with the correct day number based on its date
    for (const post of posts) {
      const postDate = new Date(post.date)
      const correctDayNumber = getDayNumberForDate(postDate)

      // Only update if the day number is different
      if (post.day !== correctDayNumber) {
        await db.collection("status_posts").updateOne({ _id: post._id }, { $set: { day: correctDayNumber } })

        console.log(`Updated post ${post._id} from day ${post.day} to day ${correctDayNumber}`)
      }
    }

    return NextResponse.json({ success: true, message: "Posts updated successfully" })
  } catch (error) {
    console.error("Error fixing posts:", error)
    return NextResponse.json({ success: false, error: "Failed to fix posts" }, { status: 500 })
  }
}
