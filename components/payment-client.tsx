"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { APIError, createPayment, CreatePaymentResponse } from "@/lib/api"

interface PaymentClientProps {
  orderNumber: string
}

export function PaymentClient({ orderNumber }: PaymentClientProps) {
  const router = useRouter()
  const { items, subtotal, tax, total } = useCart()

  const [loading, setLoading] = useState(true)
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderNumber) return

    const loadPayment = async () => {
      setLoading(true)
      setError(null)
      try {
        const data: CreatePaymentResponse = await createPayment(orderNumber)
        const paypalId = data.paypal_order_id
        const approval = data.approval_url

        if (!paypalId || !approval) {
          throw new Error("Payment initialization failed. Missing PayPal data.")
        }

        setPaypalOrderId(paypalId)
        setApprovalUrl(approval)

        if (typeof window !== "undefined") {
          try {
            let knownOrderId: number | null = null
            const checkoutRaw = window.sessionStorage.getItem(
              `checkout_order_${orderNumber}`
            )
            if (checkoutRaw) {
              const checkoutParsed = JSON.parse(checkoutRaw) as {
                order_id?: number | string | null
              }
              const oid = checkoutParsed.order_id
              if (typeof oid === "number") {
                knownOrderId = oid
              } else if (typeof oid === "string") {
                const parsed = Number(oid)
                if (!Number.isNaN(parsed)) {
                  knownOrderId = parsed
                }
              }
            }

            window.sessionStorage.setItem(
              `paypal_order_${paypalId}`,
              JSON.stringify({
                order_number: orderNumber,
                order_id: knownOrderId,
                paypal_order_id: paypalId,
              })
            )
          } catch {
            // ignore storage failures
          }
        }
      } catch (err: any) {
        console.error("[payment] Failed to create payment", err)
        let message = "Failed to start payment. Please try again."
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

    void loadPayment()
  }, [orderNumber, items.length])

  const handlePayWithPaypal = () => {
    if (!approvalUrl) {
      toast.error("Unable to start PayPal payment. Please try again.")
      return
    }
    window.location.href = approvalUrl
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
        Review Your Order and Make Payment
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Order Number: {orderNumber}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Left: Price summary and PayPal block */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <CreditCard className="h-5 w-5" />
              Order Summary
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">${tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-border bg-card/60 p-6">
            <p className="text-sm font-semibold text-foreground">
              Pay with PayPal
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Secure payments powered by PayPal sandbox.
            </p>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div>
                  <p>{error}</p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="px-0 text-xs"
                    onClick={() => router.refresh()}
                  >
                    Retry payment
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="button"
              className="mt-4 w-full"
              size="lg"
              onClick={handlePayWithPaypal}
              disabled={loading || !approvalUrl}
            >
              {loading ? "Preparing PayPal..." : "Pay with PayPal"}
            </Button>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Powered by PayPal
            </p>
          </div>
        </div>

        {/* Right: Order review (only show cart-based summary when items are present) */}
        {items.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Billing Address
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This address was provided during checkout.
              </p>

              <div className="mt-4 space-y-1 text-sm text-foreground">
                {typeof window !== "undefined" ? (
                  <BillingAddressSummary orderNumber={orderNumber} />
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Order Items
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Payment Method: <span className="font-medium">PayPal</span>
              </p>

              <div className="mt-4 space-y-3 text-sm">
                {items.map(item => (
                  <div
                    key={item.book.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {item.book.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Quantity: {item.quantity}
                      </span>
                    </div>
                    <span className="text-foreground">
                      ${(item.book.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BillingAddressSummary({ orderNumber }: { orderNumber: string }) {
  if (typeof window === "undefined") return null

  let content: React.ReactNode = (
    <p className="text-sm text-muted-foreground">
      Address details unavailable. Your order will use the address you provided
      during checkout.
    </p>
  )

  try {
    const raw = window.sessionStorage.getItem(`checkout_order_${orderNumber}`)
    if (raw) {
      const parsed = JSON.parse(raw) as {
        form?: {
          first_name?: string
          last_name?: string
          email?: string
          phone_number?: string
          address_line_1?: string
          address_line_2?: string
          city?: string
          state?: string
          pincode?: string
          country?: string
        }
      }
      const f = parsed.form || {}
      const fullName = [f.first_name, f.last_name].filter(Boolean).join(" ")
      const lines = [
        fullName,
        f.email,
        f.phone_number,
        f.address_line_1,
        f.address_line_2,
        [f.city, f.state, f.pincode].filter(Boolean).join(", "),
        f.country,
      ].filter(Boolean)

      if (lines.length) {
        content = (
          <div className="space-y-0.5">
            {lines.map((line, idx) => (
              <p key={idx} className="text-sm text-foreground">
                {line}
              </p>
            ))}
          </div>
        )
      }
    }
  } catch {
    // ignore parse errors
  }

  return <>{content}</>
}

