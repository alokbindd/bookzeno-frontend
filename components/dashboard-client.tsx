"use client"

import { useEffect, useState } from "react"
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
import { useAuth } from "@/lib/auth-context"
import { getOrders } from "@/lib/api"

interface Order {
  id: number
  order_number: string
  total_amount: number
  status: string
  created_at: string
  items: any[]
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  paid: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

export function DashboardClient() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await getOrders()
        if (ordersData?.results) {
          setOrders(ordersData.results)
        } else if (Array.isArray(ordersData)) {
          setOrders(ordersData)
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)

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
            <h2 className="text-lg font-semibold text-foreground">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user?.email || "User"}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {user?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Member since {new Date().toLocaleDateString()}
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
            value: `$${totalSpent.toFixed(2)}`,
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

        {loading ? (
          <div className="mt-4 flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-4 rounded-lg border border-border bg-card p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">No orders yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              When you place orders, they will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.order_number || `#${order.id}`}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[order.status] || "bg-gray-100 text-gray-800"}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${order.total_amount?.toFixed(2) || "0.00"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
