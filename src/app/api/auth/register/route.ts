import { type NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail } from "@/lib/data-store"

export async function POST(request: NextRequest) {
  try {
    console.log("Registration API called")
    const { username, email, password, interests } = await request.json()
    console.log("Registration data:", { username, email, interests: interests?.length })

    // Validation
    if (!username || !email || !password || !interests || interests.length < 3) {
      console.log("Validation failed")
      return NextResponse.json(
        { error: "Username, email, password, and at least 3 interests are required" },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Simple hash function for development (replace with proper bcrypt in production)
    function simpleHash(password: string): string {
      let hash = 0
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
      }
      return hash.toString()
    }

    const hashedPassword = simpleHash(password)
    console.log("Password hashed")

    const newUser = createUser({
      username,
      email,
      password: hashedPassword,
      interests,
    })

    console.log("User created successfully:", newUser.id)

    return NextResponse.json({ message: "User created successfully", userId: newUser.id }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
