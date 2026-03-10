import type { Metadata } from "next"
import Link from "next/link"
import Logo from "@/components/logo"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password - Bookzeno",
  description: "Reset your Bookzeno account password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Logo size={50} />
        <span className="text-2xl font-bold font-serif text-foreground">Bookzeno</span>
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-foreground">Forgot Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email to reset your password
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

