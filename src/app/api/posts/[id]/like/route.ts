import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

const posts: any[] = []
const likes: any[] = []

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("❤️ POST /api/posts/[id]/like called for post:", params.id)
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string }

    const existingLikeIndex = likes.findIndex((like) => like.postId === params.id && like.userId === decoded.userId)

    if (existingLikeIndex !== -1) {
      // Unlike - remove the like
      likes.splice(existingLikeIndex, 1)
      const likesCount = likes.filter((like) => like.postId === params.id).length
      console.log("💔 Post unliked, new count:", likesCount)
      return NextResponse.json({
        message: "Post unliked",
        liked: false,
        likesCount,
      })
    } else {
      // Like - add the like
      const newLike = {
        id: Date.now().toString(),
        postId: params.id,
        userId: decoded.userId,
        createdAt: new Date(),
      }
      likes.push(newLike)
      const likesCount = likes.filter((like) => like.postId === params.id).length
      console.log("❤️ Post liked, new count:", likesCount)
      return NextResponse.json({
        message: "Post liked",
        liked: true,
        likesCount,
      })
    }
  } catch (error) {
    console.error("❌ POST /api/posts/[id]/like error:", error)
    return NextResponse.json({ error: "Invalid token or server error" }, { status: 401 })
  }
}
