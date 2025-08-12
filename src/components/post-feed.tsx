"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Trash2, MoreHorizontal, Heart, MessageCircle, Send } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

interface Comment {
  id: string
  content: string
  author: { id: string; username: string }
  createdAt: string
}

interface Post {
  id: string
  content: string
  imageUrl?: string
  author: { id: string; username: string }
  createdAt: string
  likesCount?: number
  isLiked?: boolean
  comments?: Comment[]
}

interface PostFeedProps {
  refreshTrigger: number
  currentUserId?: string
}

// 👇 Single source of truth for your route prefix
const API_PREFIX = "/api/auth/posts"

export default function PostFeed({ refreshTrigger, currentUserId }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({})
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({})
  const { toast } = useToast()

  const fetchPosts = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(API_PREFIX, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      })

      if (!res.ok) {
        if (res.status === 401) {
          toast("Unauthorized", {description: "Please sign in to continue." })
        } else {
          toast("Error", {description: "Failed to load posts"})
        }
        return
      }

      const data = await res.json()
      // Accept both { posts: [...] } or [...]
      setPosts(Array.isArray(data) ? data : data.posts ?? [])
    } catch {
      toast("Error", {description: "Failed to load posts" })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem("token")
      // Optimistic UI (optional)
      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, isLiked: !p.isLiked, likesCount: (p.likesCount ?? 0) + (p.isLiked ? -1 : 1) } : p)),
      )

      const res = await fetch(`${API_PREFIX}/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("like failed")
      const data = await res.json()

      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, likesCount: data.likesCount, isLiked: data.liked } : p)),
      )
    } catch {
      toast("Error", {description: "Failed to update like"})
      // Rollback optimistic UI if needed: refetch
      fetchPosts()
    }
  }

  const addComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim()
    if (!content) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_PREFIX}/${postId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) throw new Error("comment failed")
      const data = await res.json()

      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, comments: [...(p.comments || []), data.comment] } : p)),
      )
      setCommentInputs(prev => ({ ...prev, [postId]: "" }))
      toast("Success", {description: "Comment added!" })
    } catch {
      toast("Error", {description: "Failed to add comment", })
    }
  }

  const deletePost = async (postId: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_PREFIX}/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        toast("Error", {description: "Failed to delete post",})
        return
      }

      setPosts(prev => prev.filter(p => p.id !== postId))
      toast("Success", {description: "Post deleted successfully" })
    } catch {
      toast("Error", {description: "Something went wrong", })
    }
  }

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="card-professional animate-pulse border-0">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="rounded-full bg-slate-200 h-12 w-12" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-200 rounded-lg w-1/4" />
                  <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <Card className="card-professional border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-slate-600 font-[family-name:var(--font-open-sans)] text-lg">
            Your world's waiting. Share something amazing! ✨
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Card key={post.id} className="card-professional border-0 shadow-lg animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 ring-2 ring-cyan-100">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-semibold text-lg">
                    {post.author.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-slate-800 font-[family-name:var(--font-work-sans)]">
                    {post.author.username}
                  </p>
                  <p className="text-sm text-slate-500 font-[family-name:var(--font-open-sans)]">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {currentUserId === post.author.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => deletePost(post.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-slate-700 leading-relaxed mb-4 font-[family-name:var(--font-open-sans)]">
              {post.content}
            </p>

            {post.imageUrl && (
              <img
                src={post.imageUrl || "/placeholder.svg"}
                alt="Post image"
                className="rounded-xl max-h-96 w-full object-cover mb-4 shadow-md"
              />
            )}

            <div className="flex items-center space-x-6 pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleLike(post.id)}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  post.isLiked ? "text-red-500 hover:text-red-600 animate-heart-pop" : "text-slate-500 hover:text-red-500"
                } font-[family-name:var(--font-open-sans)]`}
              >
                <Heart className={`h-5 w-5 transition-all duration-200 ${post.isLiked ? "fill-current" : ""}`} />
                <span className="font-medium">{post.likesCount || 0}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleComments(post.id)}
                className="flex items-center space-x-2 text-slate-500 hover:text-cyan-600 transition-colors duration-200 font-[family-name:var(--font-open-sans)]"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">{post.comments?.length || 0}</span>
              </Button>
            </div>

            <Collapsible open={!!showComments[post.id]} onOpenChange={() => toggleComments(post.id)}>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="flex space-x-3">
                  <Input
                    placeholder="Share your thoughts..."
                    value={commentInputs[post.id] || ""}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [postId]: e.target.value } as any))}
                    onKeyDown={e => {
                      if (e.key === "Enter") addComment(post.id)
                    }}
                    className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500 rounded-xl font-[family-name:var(--font-open-sans)]"
                  />
                  <Button
                    size="sm"
                    onClick={() => addComment(post.id)}
                    disabled={!commentInputs[post.id]?.trim()}
                    className="gradient-primary btn-hover rounded-xl px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {!!post.comments?.length && (
                  <div className="space-y-3">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="flex space-x-3 animate-slide-up">
                        <Avatar className="h-8 w-8 ring-1 ring-slate-2 00">
                          <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-500 text-white text-sm font-medium">
                            {comment.author.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-slate-50 rounded-xl px-4 py-3 shadow-sm">
                            <p className="font-semibold text-sm text-slate-800 font-[family-name:var(--font-work-sans)]">
                              {comment.author.username}
                            </p>
                            <p className="text-slate-700 font-[family-name:var(--font-open-sans)]">{comment.content}</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-2 font-[family-name:var(--font-open-sans)]">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
