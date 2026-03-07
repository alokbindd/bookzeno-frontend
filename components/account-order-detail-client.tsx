"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { BookOpen } from "lucide-react"
import { getOrderByNumber } from "@/lib/api"

export function AccountOrderDetailClient() {
  const params = useParams<{ order_number: string }>()
  const orderNumber = params?.order_number
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderNumber) return
    const load = async () => {
      try {
        const data = await getOrderByNumber(orderNumber)
        setOrder((data as any).data ?? data)
      } catch (error) {
        console.error("[account] Failed to load order detail", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderNumber])

  const currency = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (!order) {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to load order details.
      </p>
    )
  }

  const items = order.items || order.order_items || []

  // Payment details
  const payment = order.payments || order.payment || null
  const paymentMethod =
    payment?.payment_method || order.payment_method || "—"
  const transactionId =
    payment?.payment_id || payment?.id || order.transaction_id || "—"
  const paidOnRaw = payment?.created_at || payment?.paid_at || order.paid_at

  // Customer details
  const customerName =
    order.full_name || order.customer_name || order.name || "—"
  const customerEmail =
    order.email || order.customer_email || order.user_email || "—"
  const customerPhone =
    order.phone_number ||
    order.phone ||
    order.customer_phone ||
    order.contact_number ||
    "—"

  const normalize = (v: any) =>
    String(v ?? "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()

  const baseFullAddress = order.full_address || order.shipping_address || order.address
  const extraParts = [order.city, order.state, order.pincode, order.country].filter(
    Boolean
  )
  const dedupedExtras = baseFullAddress
    ? extraParts.filter((p: any) => !normalize(baseFullAddress).includes(normalize(p)))
    : extraParts

  const fullAddress =
    [baseFullAddress, ...dedupedExtras]
      .filter(Boolean)
      .join(", ") ||
    [
      order.address_line1,
      order.address_line2,
      order.city,
      order.state,
      order.pincode,
      order.country,
    ]
      .filter(Boolean)
      .join(", ") ||
    "—"

  const subtotalRaw =
    order.subtotal ??
    order.total_before_tax ??
    order.total_amount ??
    order.order_total ??
    0
  const taxRaw = order.tax_amount ?? order.tax ?? 0
  const grandRaw =
    order.grand_total ??
    order.total_with_tax ??
    order.total ??
    (parseFloat(subtotalRaw) || 0) + (parseFloat(taxRaw) || 0)

  const subtotal =
    typeof subtotalRaw === "string" ? parseFloat(subtotalRaw) : subtotalRaw
  const tax = typeof taxRaw === "string" ? parseFloat(taxRaw) : taxRaw
  const grand = typeof grandRaw === "string" ? parseFloat(grandRaw) : grandRaw

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-section,
          #invoice-section * {
            visibility: visible;
          }
          #invoice-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 1.5rem;
          }
        }
      `}</style>

      <div id="invoice-section" className="space-y-6 rounded-lg bg-background">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Order {order.order_number || orderNumber}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed on{" "}
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="text-right">
              <p className="text-base font-semibold text-foreground">
                Bookzeno
              </p>
              <p className="text-xs text-muted-foreground">
                www.bookzeno.com
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Order Information
            </h2>
            <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <dt>Order Number</dt>
                <dd className="text-foreground">
                  {order.order_number || orderNumber}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Status</dt>
                <dd className="capitalize text-foreground">
                  {order.status}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Payment Method</dt>
                <dd className="text-foreground">{paymentMethod}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Transaction ID</dt>
                <dd className="text-foreground">{transactionId}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Paid on</dt>
                <dd className="text-foreground">
                  {paidOnRaw
                    ? new Date(paidOnRaw).toLocaleString()
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Customer Information
            </h2>
            <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <dt>Name</dt>
                <dd className="text-foreground">{customerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Email</dt>
                <dd className="text-foreground">{customerEmail}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Phone</dt>
                <dd className="text-foreground">{customerPhone}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Address</dt>
                <dd className="max-w-xs text-right text-foreground">
                  {fullAddress}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr>
                <th className="px-4 py-2">Book</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => {
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
                const total =
                  item.total ??
                  (price || 0) *
                    (typeof qty === "string" ? parseInt(qty, 10) : qty)
                const book = item.book || item.product || {}
                const title =
                  book.title || item.book_title || item.title || "Book"
                const cover =
                  book.cover_image ||
                  book.cover_image_url ||
                  book.image ||
                  item.cover_image

                return (
                  <tr key={idx} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      {cover ? (
                        <div className="relative h-16 w-12 overflow-hidden rounded">
                          <Image
                            src={cover}
                            alt={title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-12 rounded bg-muted" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground">{title}</td>
                    <td className="px-4 py-3 text-center">{qty}</td>
                    <td className="px-4 py-3">
                      {currency.format(price || 0)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {currency.format(
                        typeof total === "string"
                          ? parseFloat(total)
                          : total || 0
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex flex-col items-end gap-1 text-sm">
          <div className="flex w-full max-w-sm justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">
              {currency.format(subtotal || 0)}
            </span>
          </div>
          <div className="flex w-full max-w-sm justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span className="text-foreground">
              {currency.format(tax || 0)}
            </span>
          </div>
          <div className="mt-1 flex w-full max-w-sm justify-between border-t border-border pt-2">
            <span className="font-semibold text-foreground">
              Grand Total
            </span>
            <span className="font-semibold text-foreground">
              {currency.format(grand || 0)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="mt-4 inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted print:hidden"
      >
        Download Invoice (PDF)
      </button>
    </>
  )
}

