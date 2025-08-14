"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

const INTERESTS = [
  "Technology",
  "Sports",
  "Music",
  "Art",
  "Travel",
  "Food",
  "Photography",
  "Gaming",
  "Books",
  "Movies",
  "Fitness",
  "Fashion",
]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    interests: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      interests: checked ? [...prev.interests, interest] : prev.interests.filter((i) => i !== interest),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with data:", formData)
    setIsLoading(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      console.log("Making API request...")
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log("API response received:", response.status)

      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token)
          localStorage.setItem("user", JSON.stringify(data.user))
        }
        toast("Welcome to ConnectHub!", {description: "Your account has been created successfully." })
        console.log("Navigating to dashboard...")
        router.push("/dashboard")
      } else {
        toast("Error",{
          description: data.error || "Failed to create account",
          // variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      if (error instanceof Error && error.name === "AbortError") {
        toast("Error",{
          description: "Request timed out. Please try again.",
          // variant: "destructive",
        })
      } else {
        toast("Error",{
          description: "Something went wrong. Please try again.",
          // variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-professional animate-slide-up">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Join ConnectHub
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">Create your account and start connecting</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="h-12 border-2 border-gray-200 focus:border-cyan-500 transition-colors"
                placeholder="Choose a unique username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="h-12 border-2 border-gray-200 focus:border-cyan-500 transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="h-12 border-2 border-gray-200 focus:border-cyan-500 transition-colors"
                placeholder="Create a strong password"
                required
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Interests (select at least 3)
                <span className="ml-2 text-xs text-cyan-600 font-medium">{formData.interests.length}/3 minimum</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((interest) => (
                  <div
                    key={interest}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={interest}
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                      className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <Label htmlFor={interest} className="text-sm font-medium cursor-pointer">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold text-lg btn-hover"
              disabled={isLoading || formData.interests.length < 3}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
