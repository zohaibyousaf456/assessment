"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Search, User, FileText, MessageCircle, UserPlus, UserMinus } from "lucide-react"

interface SearchUser {
  id: string
  username: string
  interests: string[]
  isFollowing?: boolean
}

interface SearchPost {
  id: string
  content: string
  imageUrl?: string
  author: {
    id: string
    username: string
  }
  createdAt: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onChatUser: (user: { id: string; username: string }) => void
}

export default function SearchModal({ isOpen, onClose, onChatUser }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<SearchUser[]>([])
  const [posts, setPosts] = useState<SearchPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("users")
  const { toast } = useToast()

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUsers([])
      setPosts([])
      return
    }

    setIsLoading(true)
    const token = localStorage.getItem("token")

    try {
      const [usersRes, postsRes] = await Promise.all([
        fetch(`/api/search/users?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/search/posts?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users.map((user: SearchUser) => ({ ...user, isFollowing: false })))
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData.posts)
      }
    } catch (error) {
      toast(
        "Error",{
        description: "Failed to perform search",
        // // // variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, isFollowing: data.following } : user)))
        toast(
          "Success",{
          description: data.following ? "User followed!" : "User unfollowed!",
        })
      }
    } catch (error) {
      toast(
        "Error",{
        description: "Failed to update follow status",
        // // // variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleClose = () => {
    setQuery("")
    setUsers([])
    setPosts([])
    onClose()
  }

  const handleChatClick = (user: SearchUser) => {
    onChatUser({ id: user.id, username: user.username })
    handleClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Search ConnectHub</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for users or posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {query.trim() && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Users ({users.length})</span>
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Posts ({posts.length})</span>
                </TabsTrigger>
              </TabsList>

              <div className="max-h-96 overflow-y-auto">
                <TabsContent value="users" className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <Card key={user.id} className="hover:bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold">{user.username}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {user.interests.slice(0, 3).map((interest) => (
                                    <span
                                      key={interest}
                                      className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                                    >
                                      {interest}
                                    </span>
                                  ))}
                                  {user.interests.length > 3 && (
                                    <span className="text-xs text-muted-foreground">
                                      +{user.interests.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleChatClick(user)}>
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={user.isFollowing ? "secondary" : "default"}
                                onClick={() => toggleFollow(user.id)}
                              >
                                {user.isFollowing ? (
                                  <UserMinus className="h-4 w-4" />
                                ) : (
                                  <UserPlus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No users found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="posts" className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                  ) : posts.length > 0 ? (
                    posts.map((post) => (
                      <Card key={post.id} className="cursor-pointer hover:bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {post.author.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-semibold text-sm">{post.author.username}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <p className="text-sm leading-relaxed">{post.content}</p>
                              {post.imageUrl && (
                                <img
                                  src={post.imageUrl || "/placeholder.svg"}
                                  alt="Post image"
                                  className="rounded-lg max-h-32 w-full object-cover mt-2"
                                />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No posts found</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          )}

          {!query.trim() && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Start typing to search for users and posts</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
