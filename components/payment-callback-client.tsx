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
  const [orderIdForRetry, setOrderIdForRetry] = useState<number | null>(null)

  useEffect(() => {
    const paypalOrderId =
      searchParams.get("paypal_order_id") || searchParams.get("token")

    if (!paypalOrderId) {
      setError("Missing PayPal order information. Unable to complete payment.")
      setLoading(false)
      return
    }

    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem(
          `paypal_order_${paypalOrderId}`
        )
        if (stored) {
          const parsed = JSON.parse(stored) as { order_id?: number }
          if (parsed.order_id) {
            setOrderIdForRetry(parsed.order_id)
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
        const orderId = Number((data as any).order_id)

        if (!orderId || Number.isNaN(orderId)) {
          throw new Error("Payment captured but order id is missing.")
        }

        try {
          await clearCart()
        } catch {
          // ignore cart clear error
        }

        router.replace(`/order-success/${orderId}`)
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
          {orderIdForRetry && (
            <Button
              type="button"
              onClick={() => router.push(`/payment/${orderIdForRetry}`)}
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

