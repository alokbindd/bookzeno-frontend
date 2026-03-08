"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
        console.error("[account] Failed to load orders", error)
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
    <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead>Order Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Order Total</TableHead>
            <TableHead>Tax</TableHead>
            <TableHead>Grand Total</TableHead>
            <TableHead>Pay</TableHead>
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
                  {created ? new Date(created).toLocaleDateString(undefined, {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }) : "—"}
                </TableCell>
                <TableCell className="text-sm capitalize">
                  {status}
                </TableCell>
                <TableCell className="text-sm">
                  {currency.format(orderTotal || 0)}
                </TableCell>
                <TableCell className="text-sm">
                  {currency.format(tax || 0)}
                </TableCell>
                <TableCell className="text-sm font-semibold">
                  {currency.format(grand || 0)}
                </TableCell>
                <TableCell className="text-sm">
                  {normalizedStatus === "paid" || normalizedStatus === "completed" ? (
                    <span className="text-muted-foreground">Paid</span>
                  ) : normalizedStatus === "pending" ? (
                    <Link
                      href={`/payment/${orderNumber}`}
                      className="font-medium text-primary hover:underline"
                    >
                      Pay
                    </Link>
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
  )
}

