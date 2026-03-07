import type { Metadata } from "next"
import { AccountOrderDetailClient } from "@/components/account-order-detail-client"

export const metadata: Metadata = {
  title: "Order Details - Bookzeno",
}

export default function AccountOrderDetailPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-foreground">Order Details</h1>
      <AccountOrderDetailClient />
    </div>
  )
}

