import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

// In-memory storage for users
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
      return NextResponse.json({ users: [] })
    }

    // Search users by username (case-insensitive)
    const searchResults = users
      .filter((user) => user.username.toLowerCase().includes(query.toLowerCase()))
      .map((user) => ({
        id: user.id,
        username: user.username,
        interests: user.interests,
      }))
      .slice(0, 10) // Limit to 10 results

    return NextResponse.json({ users: searchResults })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
