"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrderSuccessClientProps {
  orderNumber: string
}

export function OrderSuccessClient({ orderNumber }: OrderSuccessClientProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center lg:px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
      </div>
      <h1 className="mt-4 font-serif text-2xl font-bold text-foreground md:text-3xl">
        Payment Successful
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Thank you for your purchase. Your order has been placed successfully.
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">
        Order Number: <span className="font-semibold">{orderNumber}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        You will receive an email confirmation with your order details.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/account/orders">View My Orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  )
}

