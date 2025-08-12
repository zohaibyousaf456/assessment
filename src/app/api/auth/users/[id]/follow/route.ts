import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

// In-memory storage for follows
const follows: Array<{
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}> = []

const users: Array<{
  id: string
  username: string
  email: string
  password: string
  interests: string[]
  createdAt: Date
}> = []

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string }

    // Can't follow yourself
    if (decoded.userId === params.id) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 })
    }

    // Check if user exists
    const userToFollow = users.find((u) => u.id === params.id)
    if (!userToFollow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if already following
    const existingFollow = follows.find(
      (follow) => follow.followerId === decoded.userId && follow.followingId === params.id,
    )

    if (existingFollow) {
      // Unfollow - remove the follow
      const followIndex = follows.findIndex((follow) => follow.id === existingFollow.id)
      follows.splice(followIndex, 1)

      return NextResponse.json({
        message: "User unfollowed",
        following: false,
      })
    } else {
      // Follow - add the follow
      const newFollow = {
        id: Date.now().toString(),
        followerId: decoded.userId,
        followingId: params.id,
        createdAt: new Date(),
      }

      follows.push(newFollow)

      return NextResponse.json({
        message: "User followed",
        following: true,
      })
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid token or server error" }, { status: 401 })
  }
}
