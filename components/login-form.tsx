"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
   const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      await login(formData.email, formData.password)
      toast.success("Login successful!")
      router.push("/")
    } catch (error: any) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Login error:", error)
      }
      let message = "Login failed. Please check your credentials."

      const data = (error && (error as any).data) || {}
      const errors = (data as any).errors || data

      if (Array.isArray(errors?.non_field_errors) && errors.non_field_errors[0]) {
        message = errors.non_field_errors[0]
      } else if (typeof errors?.detail === "string") {
        message = errors.detail
      } else if (error?.message) {
        message = error.message
      }

      toast.error(message)
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email or Username</Label>
        <Input
          id="email"
          name="email"
          type="text"
          placeholder="you@example.com or username"
          required
          autoComplete="email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            className="pr-10"
            value={formData.password}
            onChange={handleInputChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <Button type="submit" className="mt-2 w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link
          href="/forgot-password"
          className="font-medium text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </p>
    </form>
  )
}
