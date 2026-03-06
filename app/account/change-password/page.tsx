import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChangePasswordForm } from "@/components/change-password-form"

export const metadata: Metadata = {
  title: "Change Password - Bookzeno",
  description: "Change your Bookzeno account password",
}

export default function ChangePasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-md px-4 py-12">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold text-foreground">Change Password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your account password
              </p>
            </div>

            <ChangePasswordForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}