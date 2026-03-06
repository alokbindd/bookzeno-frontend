"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ActivationPageProps {
  params: Promise<{ uid: string; token: string }>
}

export default function ActivationPage({ params }: ActivationPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const { uid, token } = await params

        const response = await fetch(`/api/proxy/api/accounts/activate/${uid}/${token}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          setSuccess(true)
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?message=Account activated successfully. You can now log in.")
          }, 3000)
        } else {
          const data = await response.json()
          setError(data.message || "Activation link is invalid or expired.")
        }
      } catch (err) {
        setError("Activation link is invalid or expired.")
      } finally {
        setLoading(false)
      }
    }

    activateAccount()
  }, [params, router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-12">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-foreground">Activating Account...</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while we activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm text-center">
        {success ? (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground">Account Activated!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account has been successfully activated. You can now log in.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </>
        ) : (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground">Activation Failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/register">Create New Account</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}