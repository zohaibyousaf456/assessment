"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
  currentUserId?: string
}

export function FollowButton({ targetUserId, initialFollowing, currentUserId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  if (!currentUserId || currentUserId === targetUserId) {
    return null
  }

  const handleFollow = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId,
          action: isFollowing ? "unfollow" : "follow",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.following)
        toast("Success",{
          description: data.message,
        })
      } else {
        const error = await response.json()
        toast("Error",{
          description: error.error || "Failed to update follow status",
        //   variant: "destructive",
        })
      }
    } catch (error) {
      toast("Error",{
        description: "Failed to update follow status",
        // variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={`transition-all duration-200 ${
        isFollowing
          ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
      }`}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          {isLoading ? "Unfollowing..." : "Unfollow"}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          {isLoading ? "Following..." : "Follow"}
        </>
      )}
    </Button>
  )
}
