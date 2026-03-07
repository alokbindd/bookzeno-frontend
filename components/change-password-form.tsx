"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function ChangePasswordForm() {
  const router = useRouter()
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/proxy/api/accounts/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Password updated successfully.")
        router.push("/account/dashboard")
      } else {
        const data = await response.json().catch(() => ({}))
        const errors = (data as any).errors || data
        let message = (data as any).message || "Failed to change password."
        if (Array.isArray(errors?.old_password) && errors.old_password[0]) {
          message = errors.old_password[0]
        } else if (Array.isArray(errors?.new_password) && errors.new_password[0]) {
          message = errors.new_password[0]
        }
        toast.error(message)
      }
    } catch (error: any) {
      console.error("Change password error:", error)
      toast.error(error.message || "Failed to change password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="old_password">Current Password</Label>
        <div className="relative">
          <Input
            id="old_password"
            name="old_password"
            type={showOldPassword ? "text" : "password"}
            placeholder="Enter your current password"
            required
            autoComplete="current-password"
            className="pr-10"
            value={formData.old_password}
            onChange={handleInputChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowOldPassword(!showOldPassword)}
            aria-label={showOldPassword ? "Hide password" : "Show password"}
          >
            {showOldPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="new_password">New Password</Label>
        <div className="relative">
          <Input
            id="new_password"
            name="new_password"
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter your new password"
            required
            autoComplete="new-password"
            className="pr-10"
            value={formData.new_password}
            onChange={handleInputChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowNewPassword(!showNewPassword)}
            aria-label={showNewPassword ? "Hide password" : "Show password"}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Button type="submit" className="mt-2 w-full" disabled={loading}>
        {loading ? "Changing Password..." : "Change Password"}
      </Button>
    </form>
  )
}