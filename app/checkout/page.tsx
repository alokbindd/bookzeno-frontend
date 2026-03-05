import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckoutClient } from "@/components/checkout-client"

export const metadata: Metadata = {
  title: "Checkout - Bookzeno",
  description: "Complete your purchase at Bookzeno",
}

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <CheckoutClient />
      </main>
      <Footer />
    </div>
  )
}
