"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  _id: string
  content: string
  authorId: string
  postId: string
  parentId?: string
  createdAt: string
  author: {
    _id: string
    username: string
    name?: string
    profilePicture?: string
  }
}

interface SocialInteractionsProps {
  postId: string
  initialLikes: string[]
  initialComments: Comment[]
  currentUserId?: string
}

export function SocialInteractions({ postId, initialLikes, initialComments, currentUserId }: SocialInteractionsProps) {
  const [likes, setLikes] = useState<string[]>(initialLikes)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const { toast } = useToast()

  const isLiked = currentUserId ? likes.includes(currentUserId) : false
  const likesCount = likes.length
  const commentsCount = comments.length

  const handleLike = async () => {
    if (!currentUserId || isLiking) return

    setIsLiking(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.liked) {
          setLikes([...likes, currentUserId])
        } else {
          setLikes(likes.filter((id) => id !== currentUserId))
        }
      } else {
        toast("Error",{
          description: "Failed to update like",
        //   variant: "destructive",
        })
      }
    } catch (error) {
      toast("Error",{
        description: "Failed to update like",
        // variant: "destructive",
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = async () => {
    if (!currentUserId || !newComment.trim() || isCommenting) return

    setIsCommenting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments([data.comment, ...comments])
        setNewComment("")
        toast("Success",{
          description: "Comment added successfully",
        })
      } else {
        const error = await response.json()
        toast("Error",{
          description: error.error || "Failed to add comment",
        //   variant: "destructive",
        })
      }
    } catch (error) {
      toast("Error",{
        description: "Failed to add comment",
        // variant: "destructive",
      })
    } finally {
      setIsCommenting(false)
    }
  }

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Failed to load comments:", error)
    }
  }

  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments()
    }
  }, [showComments])

  return (
    <div className="space-y-4">
      {/* Like and Comment Buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={!currentUserId || isLiking}
          className={`flex items-center gap-2 transition-all duration-200 ${
            isLiked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
          }`}
        >
          <Heart className={`h-5 w-5 transition-all duration-200 ${isLiked ? "fill-current animate-heart-pop" : ""}`} />
          <span className="font-medium">{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">{commentsCount}</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 animate-slide-up">
          {/* Add Comment */}
          {currentUserId && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{newComment.length}/500</span>
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim() || isCommenting}
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isCommenting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment._id} className="card-professional">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.profilePicture || "/placeholder.svg"} />
                      <AvatarFallback>{comment.author.name?.[0] || comment.author.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.author.name || comment.author.username}</span>
                        <span className="text-gray-500 text-xs">@{comment.author.username}</span>
                        <span className="text-gray-400 text-xs">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
