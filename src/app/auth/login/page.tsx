"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        toast("Welcome back!", {description: "Successfully signed in." })
        router.push("/dashboard")
      } else {
        toast(
          "Error",{
          description: data.error || "Invalid credentials",
        //   // variant: "destructive",
        })
      }
    } catch (error) {
      toast(
        "Error",{
        description: "Something went wrong. Please try again.",
        // variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-professional animate-slide-up shadow-2xl border-0">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent font-[family-name:var(--font-work-sans)]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-600 font-[family-name:var(--font-open-sans)] text-base">
            Sign in to your ConnectHub account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-slate-700 font-medium font-[family-name:var(--font-open-sans)]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500 rounded-xl transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-slate-700 font-medium font-[family-name:var(--font-open-sans)]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500 rounded-xl transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 gradient-primary text-white font-semibold rounded-xl btn-hover shadow-lg font-[family-name:var(--font-open-sans)]"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <div className="text-center pt-4">
            <p className="text-slate-600 font-[family-name:var(--font-open-sans)]">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
