import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

// In-memory storage for chat messages
const chatMessages: Array<{
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: Date
  read: boolean
}> = []

const users: Array<{
  id: string
  username: string
  email: string
  password: string
  interests: string[]
  createdAt: Date
}> = []

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string }

    // Get messages between current user and target user
    const messages = chatMessages
      .filter(
        (msg) =>
          (msg.senderId === decoded.userId && msg.receiverId === params.userId) ||
          (msg.senderId === params.userId && msg.receiverId === decoded.userId),
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((msg) => {
        const sender = users.find((u) => u.id === msg.senderId)
        return {
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          senderUsername: sender?.username || "Unknown",
          createdAt: msg.createdAt.toISOString(),
          isOwn: msg.senderId === decoded.userId,
        }
      })

    return NextResponse.json({ messages })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string }

    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Check if target user exists
    const targetUser = users.find((u) => u.id === params.userId)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create message
    const newMessage = {
      id: Date.now().toString(),
      senderId: decoded.userId,
      receiverId: params.userId,
      content: content.trim(),
      createdAt: new Date(),
      read: false,
    }

    chatMessages.push(newMessage)

    const sender = users.find((u) => u.id === decoded.userId)

    return NextResponse.json(
      {
        message: "Message sent successfully",
        chatMessage: {
          id: newMessage.id,
          content: newMessage.content,
          senderId: newMessage.senderId,
          senderUsername: sender?.username || "Unknown",
          createdAt: newMessage.createdAt.toISOString(),
          isOwn: true,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Invalid token or server error" }, { status: 401 })
  }
}
