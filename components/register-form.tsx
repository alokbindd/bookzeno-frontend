"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
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
      await register(
        formData.email,
        formData.password,
        formData.first_name,
        formData.last_name,
        formData.username
      )
      toast.success("Registration successful. Please check your email to activate your account.")
      router.push("/login")
    } catch (error: any) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Registration error:", error)
      }
      let message = "Registration failed. Please try again."

      const data = (error && (error as any).data) || {}
      const errors = (data as any).errors || data

      const messages: string[] = []
      if (Array.isArray(errors?.username) && errors.username[0]) {
        messages.push(`Username: ${errors.username[0]}`)
      }
      if (Array.isArray(errors?.email) && errors.email[0]) {
        messages.push(`Email: ${errors.email[0]}`)
      }
      if (Array.isArray(errors?.password) && errors.password[0]) {
        messages.push(`Password: ${errors.password[0]}`)
      }
      if (Array.isArray(errors?.non_field_errors) && errors.non_field_errors[0]) {
        messages.push(errors.non_field_errors[0])
      }
      if (!messages.length && typeof data?.message === "string") {
        messages.push(data.message)
      }

      if (messages.length) {
        message = messages.join(" ")
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
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Choose a username"
          required
          autoComplete="username"
          value={formData.username}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="first_name">First Name</Label>
        <Input
          id="first_name"
          name="first_name"
          type="text"
          placeholder="John"
          required
          autoComplete="given-name"
          value={formData.first_name}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="last_name">Last Name</Label>
        <Input
          id="last_name"
          name="last_name"
          type="text"
          placeholder="Doe"
          required
          autoComplete="family-name"
          value={formData.last_name}
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
            placeholder="Create a password"
            required
            autoComplete="new-password"
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
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  )
}
