import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PaymentClient } from "@/components/payment-client"

export const metadata: Metadata = {
  title: "Payment - Bookzeno",
  description: "Review your order and make payment",
}

interface PaymentPageProps {
  params: Promise<{ order_id: string }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { order_id } = await params

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <PaymentClient orderId={order_id} />
      </main>
      <Footer />
    </div>
  )
}

