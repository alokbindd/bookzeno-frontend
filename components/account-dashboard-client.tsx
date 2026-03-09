"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getDashboard } from "@/lib/api"

interface DashboardData {
  username: string
  email: string
  profile_picture?: string
  first_name?: string
  last_name?: string
  total_orders: number
  total_spent: number
  date_joined: string
}

export function AccountDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboard()
        const payload = (res as any).data ?? res
        setData(payload as DashboardData)
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[account] Failed to load dashboard", error)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const skeleton = (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )

  if (loading) {
    return skeleton
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to load dashboard data.
      </p>
    )
  }

  const fullName =
    data.first_name || data.last_name
      ? `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim()
      : data.username

  const joined = data.date_joined
    ? new Date(data.date_joined).toLocaleDateString()
    : ""

  const currency = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  })

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
          {data.profile_picture ? (
            <Image
              src={data.profile_picture}
              alt={data.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
              {data.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{fullName}</h1>
          <p className="text-sm text-muted-foreground">{data.email}</p>
          {joined && (
            <p className="mt-1 text-xs text-muted-foreground">
              Joined on {joined}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total Orders
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {data.total_orders}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total Spent
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {currency.format(data.total_spent || 0)}
          </p>
        </div>
      </div>
    </div>
  )
}

