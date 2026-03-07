import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PaymentCallbackClient } from "@/components/payment-callback-client"

export default function PaymentCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <PaymentCallbackClient />
      </main>
      <Footer />
    </div>
  )
}

