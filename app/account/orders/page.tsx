import type { Metadata } from "next"
import { AccountOrdersClient } from "@/components/account-orders-client"

export const metadata: Metadata = {
  title: "My Orders - Bookzeno",
}

export default function AccountOrdersPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-foreground">Orders</h1>
      <AccountOrdersClient />
    </div>
  )
}

