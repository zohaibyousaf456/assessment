"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Search, Sparkles } from "lucide-react"
import CreatePost from "@/components/create-post"
import PostFeed from "@/components/post-feed"
import SearchModal from "@/components/search-modal"
import ChatModal from "@/components/chat-modal"

interface User {
  id: string
  username: string
  email: string
  interests: string[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatTarget, setChatTarget] = useState<{ id: string; username: string } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          localStorage.removeItem("token")
          router.push("/auth/login")
        }
      } catch (error) {
        toast(
          "Error",{
          description: "Failed to load user data",
          // variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router, toast])

  // Added real-time polling for live updates
  useEffect(() => {
    if (user) {
      // Set up polling for real-time updates every 5 seconds
      const interval = setInterval(() => {
        setRefreshTrigger((prev) => prev + 1)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleChatUser = (targetUser: { id: string; username: string }) => {
    setChatTarget(targetUser)
    setIsChatOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-cyan-600 font-semibold font-[family-name:var(--font-open-sans)]">
          Loading your world...
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-lg border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent font-[family-name:var(--font-work-sans)]">
                ConnectHub
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="btn-hover border-cyan-200 text-cyan-700 hover:bg-cyan-50 font-[family-name:var(--font-open-sans)]"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Avatar className="ring-2 ring-cyan-100">
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-semibold">
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="btn-hover border-slate-200 text-slate-700 hover:bg-slate-50 font-[family-name:var(--font-open-sans)] bg-transparent"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="card-professional border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-800 font-[family-name:var(--font-work-sans)]">
                  Welcome, {user.username}! ✨
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 font-[family-name:var(--font-open-sans)]">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2 font-[family-name:var(--font-open-sans)]">
                      Your Interests:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 text-xs font-medium rounded-full border border-cyan-200 font-[family-name:var(--font-open-sans)]"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-professional border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-work-sans)]">
                  Real-time Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-3 h-3 gradient-accent rounded-full animate-pulse-dot"></div>
                    <span className="text-slate-600 font-medium font-[family-name:var(--font-open-sans)]">
                      Live updates active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-[family-name:var(--font-open-sans)]">
                    Posts, likes, and comments update automatically every 5 seconds
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <CreatePost onPostCreated={handlePostCreated} />
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 font-[family-name:var(--font-work-sans)]">
                Your World's Latest ✨
              </h2>
              <PostFeed refreshTrigger={refreshTrigger} currentUserId={user.id} />
            </div>
          </div>
        </div>
      </main>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onChatUser={handleChatUser} />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} targetUser={chatTarget} />
    </div>
  )
}
