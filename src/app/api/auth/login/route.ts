import { type NextRequest, NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import { findUserByEmail, getAllUsers } from "@/lib/data-store"

// Simple hash function for development (replace with proper bcrypt in production)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called")
    const { email, password } = await request.json()
    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const allUsers = getAllUsers()
    console.log("Available users:", allUsers.length)

    const user = findUserByEmail(email)
    if (!user) {
      console.log("User not found")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("User found, verifying password")

    const hashedInputPassword = simpleHash(password)
    console.log("Hashed input password:", hashedInputPassword)
    console.log("Stored password hash:", user.password)

    if (hashedInputPassword !== user.password) {
      console.log("Password verification failed")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("Password verified successfully")

    // Generate JWT token
    const token = sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    console.log("Login successful for user:", user.username)

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        interests: user.interests,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
