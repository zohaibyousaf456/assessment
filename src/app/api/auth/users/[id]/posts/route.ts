import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

// In-memory storage for posts and users
const posts: Array<{
  id: string
  content: string
  imageUrl?: string
  authorId: string
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    verify(token, JWT_SECRET)

    // Find user
    const user = users.find((u) => u.id === params.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's posts
    const userPosts = posts
      .filter((post) => post.authorId === params.id)
      .map((post) => ({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        author: {
          id: user.id,
          username: user.username,
        },
        createdAt: post.createdAt.toISOString(),
      }))

    return NextResponse.json({ posts: userPosts })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
