import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { findUserById } from "@/lib/data-store"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify JWT token
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string }

    // Using shared data store instead of local users array
    const user = findUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      interests: user.interests,
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
