import type { Metadata } from "next"
import { ChangePasswordForm } from "@/components/change-password-form"

export const metadata: Metadata = {
  title: "Account Security - Bookzeno",
}

export default function AccountSecurityPage() {
  return (
    <div className="max-w-md">
      <h1 className="mb-4 text-xl font-semibold text-foreground">Change Password</h1>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <ChangePasswordForm />
      </div>
    </div>
  )
}

