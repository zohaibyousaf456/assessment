import { type NextRequest, NextResponse } from "next/server"
import { collections } from "@/lib/database"
import { hashPassword, generateToken } from "@/lib/auth"

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

    const usersCollection = await collections.users()

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json(
        {
          error: existingUser.email === email ? "User with this email already exists" : "Username already taken",
        },
        { status: 409 },
      )
    }

    const hashedPassword = await hashPassword(password)
    console.log("Password hashed")

    const newUser = {
      username,
      email,
      password: hashedPassword,
      interests,
      name: username,
      bio: "",
      profilePicture: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)
    const userId = result.insertedId.toString()

    console.log("User created successfully:", userId)

    const token = generateToken({
      userId,
      email,
      username,
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        userId,
        token,
        user: {
          _id: userId,
          username,
          email,
          name: username,
          interests,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
