import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

const posts: any[] = []
const comments: any[] = []

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("💬 POST /api/posts/[id]/comments called for post:", params.id)
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string }

    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    const newComment = {
      id: Date.now().toString(),
      postId: params.id,
      userId: decoded.userId,
      content: content.trim(),
      createdAt: new Date(),
    }

    comments.push(newComment)
    console.log("✅ Comment created successfully")

    return NextResponse.json(
      {
        message: "Comment added successfully",
        comment: {
          id: newComment.id,
          content: newComment.content,
          author: {
            id: decoded.userId,
            username: "Test User",
          },
          createdAt: newComment.createdAt.toISOString(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ POST /api/posts/[id]/comments error:", error)
    return NextResponse.json({ error: "Invalid token or server error" }, { status: 401 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("🔍 GET /api/posts/[id]/comments called for post:", params.id)
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    verify(token, JWT_SECRET)

    const postComments = comments
      .filter((comment) => comment.postId === params.id)
      .map((comment) => ({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.userId,
          username: "Test User",
        },
        createdAt: comment.createdAt.toISOString(),
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    console.log("✅ Returning", postComments.length, "comments")
    return NextResponse.json({ comments: postComments })
  } catch (error) {
    console.error("❌ GET /api/posts/[id]/comments error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
