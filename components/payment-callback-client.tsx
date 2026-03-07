"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { APIError, capturePayment, CapturePaymentResponse } from "@/lib/api"

export function PaymentCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderNumberForRetry, setOrderNumberForRetry] = useState<string | null>(
    null
  )

  useEffect(() => {
    const paypalOrderId =
      searchParams.get("paypal_order_id") || searchParams.get("token")

    if (!paypalOrderId) {
      setError("Missing PayPal order information. Unable to complete payment.")
      setLoading(false)
      return
    }

    let storedOrderNumber: string | null = null
    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem(
          `paypal_order_${paypalOrderId}`
        )
        if (stored) {
          const parsed = JSON.parse(stored) as {
            order_id?: number | string
            order_number?: string
          }
          if (parsed.order_number) {
            storedOrderNumber = String(parsed.order_number)
            setOrderNumberForRetry(storedOrderNumber)
          } else if (parsed.order_id != null) {
            storedOrderNumber = String(parsed.order_id)
            setOrderNumberForRetry(storedOrderNumber)
          }
        }
      } catch {
        // ignore
      }
    }

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data: CapturePaymentResponse = await capturePayment(paypalOrderId)
        const rawOrderId = (data as any).order_id

        // Prefer the original order_number used to create the payment.
        let redirectIdentifier: string | null = storedOrderNumber

        // Fallbacks if we didn't have it in storage.
        if (!redirectIdentifier) {
          const responseOrderNumber = (data as any).order_number
          if (responseOrderNumber) {
            redirectIdentifier = String(responseOrderNumber)
          } else if (rawOrderId != null) {
            redirectIdentifier = String(rawOrderId)
          }
        }

        if (!redirectIdentifier) {
          throw new Error("Payment captured but order reference is missing.")
        }

        try {
          await clearCart()
        } catch {
          // ignore cart clear error
        }

        router.replace(`/order-success/${redirectIdentifier}`)
      } catch (err: any) {
        console.error("[payment] Failed to capture payment", err)
        let message = "Failed to capture payment. Please try again."
        if (err instanceof APIError) {
          message =
            (err.data && (err.data.message || err.data.detail)) ||
            err.message ||
            message
        } else if (typeof err?.message === "string") {
          message = err.message
        }
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [searchParams, clearCart, router])

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center lg:px-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">
          Finalizing your payment
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we confirm your PayPal payment.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center lg:px-8">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">
          Payment Error
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {orderNumberForRetry && (
            <Button
              type="button"
              onClick={() => router.push(`/payment/${orderNumberForRetry}`)}
            >
              Retry Payment
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/cart")}
          >
            Back to Cart
          </Button>
        </div>
      </div>
    )
  }

  return null
}

