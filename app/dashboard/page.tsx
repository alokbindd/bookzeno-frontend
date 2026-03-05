import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DashboardClient } from "@/components/dashboard-client"

export const metadata: Metadata = {
  title: "My Account - Bookzeno",
  description: "Manage your Bookzeno account and view order history",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <DashboardClient />
      </main>
      <Footer />
    </div>
  )
}
