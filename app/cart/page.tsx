import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartClient } from "@/components/cart-client"

export const metadata: Metadata = {
  title: "Shopping Cart - Bookzeno",
  description: "Review items in your shopping cart",
}

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <CartClient />
      </main>
      <Footer />
    </div>
  )
}
