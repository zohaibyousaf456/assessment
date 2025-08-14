import { type NextRequest, NextResponse } from "next/server"
import { collections } from "@/lib/database"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetUserId, action } = await request.json()

    if (!targetUserId || !action || !["follow", "unfollow"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    if (targetUserId === user._id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    const followsCollection = await collections.follows()

    if (action === "follow") {
      // Check if already following
      const existingFollow = await followsCollection.findOne({
        followerId: user._id,
        followingId: targetUserId,
      })

      if (existingFollow) {
        return NextResponse.json({ error: "Already following this user" }, { status: 400 })
      }

      // Create follow relationship
      await followsCollection.insertOne({
        followerId: user._id,
        followingId: targetUserId,
        createdAt: new Date(),
      })

      return NextResponse.json({ message: "Successfully followed user", following: true })
    } else {
      // Unfollow
      await followsCollection.deleteOne({
        followerId: user._id,
        followingId: targetUserId,
      })

      return NextResponse.json({ message: "Successfully unfollowed user", following: false })
    }
  } catch (error) {
    console.error("Follow/unfollow error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "following" or "followers"
    const userId = searchParams.get("userId") || user._id

    const followsCollection = await collections.follows()
    const usersCollection = await collections.users()

    let follows
    if (type === "followers") {
      follows = await followsCollection.find({ followingId: userId }).toArray()
      const followerIds = follows.map((f: { followerId: any }) => f.followerId)
      const followers = await usersCollection.find({ _id: { $in: followerIds } }).toArray()
      return NextResponse.json({ followers })
    } else {
      follows = await followsCollection.find({ followerId: userId }).toArray()
      const followingIds = follows.map((f: { followingId: any }) => f.followingId)
      const following = await usersCollection.find({ _id: { $in: followingIds } }).toArray()
      return NextResponse.json({ following })
    }
  } catch (error) {
    console.error("Get follows error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
