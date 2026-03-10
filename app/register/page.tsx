import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { RegisterForm } from "@/components/register-form"

export const metadata: Metadata = {
  title: "Register - Bookzeno",
  description: "Create your Bookzeno account",
}

export default function RegisterPage() {
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
          <h1 className="text-xl font-bold text-foreground">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join thousands of book lovers
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
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
