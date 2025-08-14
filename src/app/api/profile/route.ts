import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

// Import users from register route (in production, use shared database)
const users: Array<{
  id: string
  username: string
  email: string
  password: string
  interests: string[]
  createdAt: Date
}> = []

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string }

    const { username, interests } = await request.json()

    // Find and update user
    const userIndex = users.findIndex((u) => u.id === decoded.userId)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user data
    if (username) users[userIndex].username = username
    if (interests) users[userIndex].interests = interests

    const updatedUser = users[userIndex]

    return NextResponse.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      interests: updatedUser.interests,
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token or server error" }, { status: 401 })
  }
}
