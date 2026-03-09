"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { APIError, createPayment, CreatePaymentResponse, getOrderByNumber } from "@/lib/api"

interface PaymentClientProps {
  orderNumber: string
}

export function PaymentClient({ orderNumber }: PaymentClientProps) {
  const router = useRouter()
  const [order, setOrder] = useState<any | null>(null)
  const [orderLoading, setOrderLoading] = useState(true)
  const [orderError, setOrderError] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currency = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  })

  useEffect(() => {
    if (!orderNumber) return

    const loadOrder = async () => {
      setOrderLoading(true)
      setOrderError(null)
      try {
        const data = await getOrderByNumber(orderNumber)
        const ord = (data as any).data ?? data
        setOrder(ord)

        const statusRaw = ord.status || ord.state || ""
        const normalizedStatus = String(statusRaw || "").toLowerCase()
        if (normalizedStatus === "paid" || normalizedStatus === "completed") {
          router.replace(`/account/orders/${orderNumber}`)
        }
      } catch (err: any) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[payment] Failed to load order", err)
        }
        let message = "Failed to load order details. Please try again."
        if (err instanceof APIError) {
          message =
            (err.data && (err.data.message || err.data.detail)) ||
            err.message ||
            message
        } else if (typeof err?.message === "string") {
          message = err.message
        }
        setOrderError(message)
        toast.error(message)
      } finally {
        setOrderLoading(false)
      }
    }

    void loadOrder()
  }, [orderNumber, router])

  const items: any[] = (order?.items || order?.order_items || []) ?? []

  const subtotalRaw =
    order?.subtotal ??
    order?.total_before_tax ??
    order?.total_amount ??
    order?.order_total ??
    0
  const taxRaw = order?.tax_amount ?? order?.tax ?? 0
  const grandRaw =
    order?.grand_total ??
    order?.total_with_tax ??
    order?.total ??
    (typeof subtotalRaw === "string" ? parseFloat(subtotalRaw) || 0 : subtotalRaw || 0) +
      (typeof taxRaw === "string" ? parseFloat(taxRaw) || 0 : taxRaw || 0)

  const subtotal =
    typeof subtotalRaw === "string" ? parseFloat(subtotalRaw) || 0 : subtotalRaw || 0
  const tax = typeof taxRaw === "string" ? parseFloat(taxRaw) || 0 : taxRaw || 0
  const total =
    typeof grandRaw === "string" ? parseFloat(grandRaw) || 0 : grandRaw || 0

  const payment = order?.payments || order?.payment || null
  const paymentMethod =
    payment?.payment_method || order?.payment_method || "PayPal"

  const customerName =
    order?.full_name || order?.customer_name || order?.name || ""
  const customerEmail =
    order?.email || order?.customer_email || order?.user_email || ""
  const customerPhone =
    order?.phone_number ||
    order?.phone ||
    order?.customer_phone ||
    order?.contact_number ||
    ""

  const normalize = (v: any) =>
    String(v ?? "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()

  const baseFullAddress =
    order?.full_address || order?.shipping_address || order?.address
  const extraParts = [
    order?.city,
    order?.state,
    order?.pincode,
    order?.country,
  ].filter(Boolean)
  const dedupedExtras = baseFullAddress
    ? extraParts.filter((p: any) => !normalize(baseFullAddress).includes(normalize(p)))
    : extraParts

  const fullAddress =
    [baseFullAddress, ...dedupedExtras]
      .filter(Boolean)
      .join(", ") ||
    [
      order?.address_line1,
      order?.address_line2,
      order?.address_line_1,
      order?.address_line_2,
      order?.city,
      order?.state,
      order?.pincode,
      order?.country,
    ]
      .filter(Boolean)
      .join(", ")

  const orderNoteRaw =
    order?.order_note ?? order?.orderNote ?? order?.note ?? order?.notes
  const orderNote =
    typeof orderNoteRaw === "string" ? orderNoteRaw.trim() : ""

  const handlePayWithPaypal = async () => {
    if (!orderNumber) return

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
          const knownOrderId =
            typeof order?.id === "number" ? order.id : null

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

      window.location.href = approval
    } catch (err: any) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[payment] Failed to create payment", err)
      }
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

  if (orderLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          <div className="h-48 rounded-lg bg-muted" />
          <div className="h-48 rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  if (orderError || !order) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center lg:px-8">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">
          Unable to load order
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {orderError || "We couldn&apos;t load the order details. Please try again from your orders page."}
        </p>
        <Button
          type="button"
          className="mt-6"
          onClick={() => router.push("/account/orders")}
        >
          View My Orders
        </Button>
      </div>
    )
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
                  {currency.format(subtotal || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">
                  {currency.format(tax || 0)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">
                  {currency.format(total || 0)}
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
              disabled={loading}
            >
              {loading ? "Preparing PayPal..." : "Pay with PayPal"}
            </Button>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Powered by PayPal
            </p>
          </div>
        </div>

        {/* Right: Order review from backend order details */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Billing Address
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This address was loaded from your order details.
            </p>

            <div className="mt-4 space-y-1 text-sm text-foreground">
              {customerName && <p>{customerName}</p>}
              {customerEmail && <p>{customerEmail}</p>}
              {customerPhone && <p>{customerPhone}</p>}
              {fullAddress && <p>{fullAddress}</p>}
            </div>

            {orderNote && (
              <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Order Note
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-foreground">
                  {orderNote}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Order Items
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Payment Method:{" "}
              <span className="font-medium">{paymentMethod}</span>
            </p>

            <div className="mt-4 space-y-3 text-sm">
              {items.map((item, idx) => {
                const qty = item.quantity ?? 1
                const priceRaw =
                  item.book_price ??
                  item.price ??
                  item.unit_price ??
                  0
                const price =
                  typeof priceRaw === "string"
                    ? parseFloat(priceRaw)
                    : priceRaw
                const lineTotal =
                  item.total ??
                  (price || 0) *
                    (typeof qty === "string" ? parseInt(qty, 10) : qty)
                const book = item.book || item.product || {}
                const title =
                  book.title || item.book_title || item.title || "Book"

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Quantity: {qty}
                      </span>
                    </div>
                    <span className="text-foreground">
                      {currency.format(
                        typeof lineTotal === "string"
                          ? parseFloat(lineTotal) || 0
                          : lineTotal || 0
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
