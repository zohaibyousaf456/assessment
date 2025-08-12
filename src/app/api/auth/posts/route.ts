import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory storage for testing
const posts: any[] = []

export async function GET() {
  console.log("✅ GET /api/posts called successfully")
  console.log("📊 Current posts count:", posts.length)

  return NextResponse.json({
    success: true,
    posts: posts,
    count: posts.length,
  })
}

export async function POST(request: NextRequest) {
  console.log("✅ POST /api/posts called successfully")

  try {
    const body = await request.json()
    console.log("📝 Post data received:", body)

    const newPost = {
      id: Date.now().toString(),
      content: body.content || "Test post",
      authorId: body.authorId || "test-user",
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
    }

    posts.push(newPost)
    console.log("✅ Post created successfully:", newPost.id)

    return NextResponse.json({
      success: true,
      post: newPost,
    })
  } catch (error) {
    console.error("❌ Error creating post:", error)
    return NextResponse.json({ success: false, error: "Failed to create post" }, { status: 500 })
  }
}
