"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderUsername: string
  createdAt: string
  isOwn: boolean
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: {
    id: string
    username: string
  } | null
}

export default function ChatModal({ isOpen, onClose, targetUser }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const fetchMessages = async () => {
    if (!targetUser) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/chat/${targetUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      toast(
        "Error",
        {
        description: "Failed to load messages",
        // // variant: "destructive",
      })
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !targetUser) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/chat/${targetUser.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [...prev, data.chatMessage])
        setNewMessage("")
      } else {
        toast(
          "Error",
          {
          description: "Failed to send message",
        //   // variant: "destructive",
        })
      }
    } catch (error) {
      toast(
        "Error",
        {
        description: "Something went wrong",
        // // variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Fetch messages when modal opens or target user changes
  useEffect(() => {
    if (isOpen && targetUser) {
      fetchMessages()
      // Set up polling for real-time updates
      const interval = setInterval(fetchMessages, 2000)
      return () => clearInterval(interval)
    }
  }, [isOpen, targetUser])

  const handleClose = () => {
    setMessages([])
    setNewMessage("")
    onClose()
  }

  if (!targetUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm">{targetUser.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>Chat with {targetUser.username}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.isOwn ? "bg-indigo-600 text-white" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.isOwn ? "text-indigo-200" : "text-muted-foreground"}`}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex space-x-2 pt-4 border-t">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage()
              }
            }}
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
