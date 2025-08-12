import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

const posts: any[] = []
const users: any[] = []

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("🔍 GET /api/posts/[id] called for ID:", params.id)
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    verify(token, JWT_SECRET)

    const post = posts.find((p) => p.id === params.id)
    if (!post) {
      console.log("❌ Post not found:", params.id)
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    console.log("✅ Post found:", post.id)
    return NextResponse.json({
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      author: {
        id: post.authorId,
        username: "Test User",
      },
      createdAt: post.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("❌ GET /api/posts/[id] error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("🗑️ DELETE /api/posts/[id] called for ID:", params.id)
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string }

    const postIndex = posts.findIndex((p) => p.id === params.id)
    if (postIndex === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const post = posts[postIndex]
    if (post.authorId !== decoded.userId) {
      return NextResponse.json({ error: "You can only delete your own posts" }, { status: 403 })
    }

    posts.splice(postIndex, 1)
    console.log("✅ Post deleted successfully")
    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("❌ DELETE /api/posts/[id] error:", error)
    return NextResponse.json({ error: "Invalid token or server error" }, { status: 401 })
  }
}
