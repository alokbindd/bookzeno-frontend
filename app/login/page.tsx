import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login - Bookzeno",
  description: "Sign in to your Bookzeno account",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <BookOpen className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold font-serif text-foreground">Bookzeno</span>
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
