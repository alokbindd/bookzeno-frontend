"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/proxy/api/accounts/password-reset/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      })

      if (response.ok) {
        toast.success("If the email exists, a password reset link has been sent.")
      } else {
        const data = await response.json()
        toast.error(data.message || "Failed to send reset email.")
      }
    } catch (error: any) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Forgot password error:", error)
      }
      toast.error("Failed to send reset email.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <Button type="submit" className="mt-2 w-full" disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  )
}