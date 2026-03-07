import type { Metadata } from "next"
import { AccountDashboardClient } from "@/components/account-dashboard-client"

export const metadata: Metadata = {
  title: "Account Dashboard - Bookzeno",
}

export default function AccountDashboardPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-foreground">Dashboard</h1>
      <AccountDashboardClient />
    </div>
  )
}

