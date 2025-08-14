import { type NextRequest, NextResponse } from "next/server"
import { collections } from "@/lib/database"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called")
    const { email, password } = await request.json()
    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const usersCollection = await collections.users()
    const user = await usersCollection.findOne({ email })

    if (!user) {
      console.log("User not found")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("User found, verifying password")

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      console.log("Password verification failed")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("Password verified successfully")

    const userId = user._id.toString()
    const token = generateToken({
      userId,
      email: user.email,
      username: user.username,
    })

    console.log("Login successful for user:", user.username)

    return NextResponse.json({
      token,
      user: {
        _id: userId,
        username: user.username,
        email: user.email,
        name: user.name,
        interests: user.interests,
        bio: user.bio,
        profilePicture: user.profilePicture,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
