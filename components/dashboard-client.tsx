"use client"

import { Package, User, Mail, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { orders } from "@/lib/data"

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  paid: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

export function DashboardClient() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
        My Account
      </h1>

      {/* User Info Card */}
      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">John Doe</h2>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                john@example.com
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Member since Jan 2025
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Orders", value: orders.length, icon: Package },
          {
            label: "Total Spent",
            value: `$${orders.reduce((s, o) => s + o.total, 0).toFixed(2)}`,
            icon: Package,
          },
          {
            label: "Delivered",
            value: orders.filter((o) => o.status === "delivered").length,
            icon: Package,
          },
          {
            label: "In Transit",
            value: orders.filter((o) => o.status === "shipped").length,
            icon: Package,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-8" />

      {/* Order History */}
      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          Order History
        </h2>

        {/* Desktop Table */}
        <div className="mt-4 hidden overflow-hidden rounded-lg border border-border md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-foreground">
                    {order.id}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.date}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.items.map((i) => i.title).join(", ")}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    ${order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${statusColors[order.status]}`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="mt-4 flex flex-col gap-3 md:hidden">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {order.id}
                </span>
                <Badge
                  variant="outline"
                  className={`capitalize ${statusColors[order.status]}`}
                >
                  {order.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{order.date}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {order.items.map((i) => i.title).join(", ")}
              </p>
              <p className="mt-2 text-sm font-bold text-foreground">
                ${order.total.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
