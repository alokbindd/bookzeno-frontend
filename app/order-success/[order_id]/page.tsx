import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { OrderSuccessClient } from "@/components/order-success-client"

export const metadata: Metadata = {
  title: "Order Success - Bookzeno",
  description: "Payment successful. View your order confirmation.",
}

interface OrderSuccessPageProps {
  params: Promise<{ order_id: string }>
}

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const { order_id } = await params

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <OrderSuccessClient orderId={order_id} />
      </main>
      <Footer />
    </div>
  )
}

