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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    verify(token, JWT_SECRET)

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ posts: [] })
    }

    // Search posts by content (case-insensitive)
    const searchResults = posts
      .filter((post) => post.content.toLowerCase().includes(query.toLowerCase()))
      .map((post) => {
        const author = users.find((u) => u.id === post.authorId)
        return {
          id: post.id,
          content: post.content,
          imageUrl: post.imageUrl,
          author: {
            id: author?.id || "",
            username: author?.username || "Unknown User",
          },
          createdAt: post.createdAt.toISOString(),
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Newest first
      .slice(0, 10) // Limit to 10 results

    return NextResponse.json({ posts: searchResults })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
