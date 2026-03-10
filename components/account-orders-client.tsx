"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAccountOrders } from "@/lib/api"

interface OrdersResponse {
  results?: any[]
  data?: any[]
}

export function AccountOrdersClient() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAccountOrders()
        const list =
          (res as OrdersResponse).results ??
          (res as OrdersResponse).data ??
          (Array.isArray(res) ? res : [])
        setOrders(list || [])
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[account] Failed to load orders", error)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currency = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  })

  if (loading) {
    return (
      <div className="mt-4 space-y-2">
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (!orders.length) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        You have no orders yet.
      </p>
    )
  }

  const getTotal = (o: any) =>
    o.grand_total ??
    o.total_with_tax ??
    o.total_amount ??
    o.total ??
    0

  const getTax = (o: any) =>
    o.tax_amount ??
    o.tax ??
    0

  const getOrderTotal = (o: any) =>
    getTotal(o) - getTax(o)

  return (
    <>
      {/* Desktop table */}
      <div className="mt-4 hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Order Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order Total</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Grand Total</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const orderNumber = order.order_number || order.number || `ORD-${order.id}`
              const created = order.created_at || order.date || order.created
              const status = order.status || order.state || "—"
              const normalizedStatus = String(status || "").toLowerCase()

              const orderTotal = getOrderTotal(order)
              const tax = getTax(order)
              const grand = getTotal(order)

              return (
                <TableRow key={order.id ?? orderNumber} className="hover:bg-muted/60">
                  <TableCell>
                    <Link
                      href={`/account/orders/${orderNumber}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {created
                      ? new Date(created).toLocaleDateString(undefined, {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {normalizedStatus === "paid" || normalizedStatus === "completed" ? (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100 border-emerald-200/80 dark:border-emerald-800"
                      >
                        Paid
                      </Badge>
                    ) : normalizedStatus === "pending" ? (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100 border-amber-200/80 dark:border-amber-800"
                      >
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        {status || "Unknown"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{currency.format(orderTotal || 0)}</TableCell>
                  <TableCell className="text-sm">{currency.format(tax || 0)}</TableCell>
                  <TableCell className="text-sm font-semibold">{currency.format(grand || 0)}</TableCell>
                  <TableCell className="text-sm">
                    {normalizedStatus === "paid" || normalizedStatus === "completed" ? (
                      <span className="text-muted-foreground">—</span>
                    ) : normalizedStatus === "pending" ? (
                      <Button asChild size="sm" className="px-3 py-1">
                        <Link href={`/payment/${orderNumber}`}>Pay Now</Link>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 space-y-3 md:hidden">
        {orders.map((order) => {
          const orderNumber = order.order_number || order.number || `ORD-${order.id}`
          const created = order.created_at || order.date || order.created
          const status = order.status || order.state || "—"
          const normalizedStatus = String(status || "").toLowerCase()
          const grand = getTotal(order)
          const isPending = normalizedStatus === "pending"

          return (
            <div
              key={order.id ?? orderNumber}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Order #{orderNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {created
                      ? new Date(created).toLocaleDateString(undefined, {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>

                <div className="shrink-0">
                  {normalizedStatus === "paid" || normalizedStatus === "completed" ? (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100 border-emerald-200/80 dark:border-emerald-800"
                    >
                      Paid
                    </Badge>
                  ) : normalizedStatus === "pending" ? (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100 border-amber-200/80 dark:border-amber-800"
                    >
                      Pending
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {status || "Unknown"}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-sm font-semibold text-foreground">
                  {currency.format(grand || 0)}
                </span>
              </div>

              <div
                className={
                  isPending
                    ? "mt-4 flex flex-col gap-2"
                    : "mt-4 flex items-center gap-2"
                }
              >
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/account/orders/${orderNumber}`}>View Details</Link>
                </Button>

                {isPending && (
                  <Button asChild className="w-full">
                    <Link href={`/payment/${orderNumber}`}>Pay Now</Link>
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

