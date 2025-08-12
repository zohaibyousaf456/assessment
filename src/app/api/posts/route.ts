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
    const formData = await request.formData()
    const content = formData.get("content") as string
    const image = formData.get("image") as File | null

    console.log("📝 Post data received:", { content, hasImage: !!image })

    // Get user ID from token (simplified for now)
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    let authorId = "anonymous"

    if (token) {
      try {
        // Simple token decode (in production, use proper JWT verification)
        const payload = JSON.parse(atob(token.split(".")[1]))
        authorId = payload.userId || payload.id || "anonymous"
      } catch (e) {
        console.log("Token decode failed, using anonymous")
      }
    }

    const newPost = {
      id: Date.now().toString(),
      content: content || "Test post",
      authorId: authorId,
      imageUrl: image ? `/uploads/${image.name}` : null, // Placeholder for image handling
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
