import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login - Bookzeno",
  description: "Sign in to your Bookzeno account",
}

interface LoginPageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const message = params.message

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="Bookzeno logo"
          width={50}
          height={50}
          priority
        />
        <span className="text-2xl font-bold font-serif text-foreground">Bookzeno</span>
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account
          </p>
          {message && (
            <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800 border border-green-200">
              {message}
            </div>
          )}
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
