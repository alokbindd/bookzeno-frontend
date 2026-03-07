"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingBag, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"

export function CheckoutClient() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOrderPlaced(true)
      clearCart()
    }, 1500)
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center lg:px-8">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">
          Your cart is empty
        </h1>
        <p className="mt-2 text-muted-foreground">
          Add some books before checking out
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Browse Books</Link>
        </Button>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center lg:px-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">
          Order Placed Successfully
        </h1>
        <p className="mt-2 text-muted-foreground">
          Thank you for your purchase! You will receive a confirmation email
          shortly.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/dashboard">View Orders</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
        Checkout
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Shipping Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 lg:col-span-2"
        >
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Shipping Address
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" required placeholder="John" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" required placeholder="Doe" />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  required
                  placeholder="123 Main Street"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" required placeholder="New York" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" required placeholder="NY" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" required placeholder="10001" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full lg:hidden"
            disabled={loading}
          >
            {loading ? "Placing Order..." : `Place Order - $${total.toFixed(2)}`}
          </Button>
        </form>

        {/* Order Summary */}
        <div className="rounded-lg border border-border bg-card p-6 h-fit">
          <h2 className="text-lg font-semibold text-foreground">
            Order Summary
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.book.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {item.book.title}{" "}
                  <span className="text-xs">x{item.quantity}</span>
                </span>
                <span className="text-foreground">
                  ${(item.book.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax (18%)</span>
              <span className="text-foreground">${tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-emerald-600">Free</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-foreground">
                Total
              </span>
              <span className="text-lg font-bold text-foreground">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            form="checkout-form"
            className="mt-6 hidden w-full lg:flex"
            size="lg"
            disabled={loading}
            onClick={() => {
              const form = document.querySelector("form")
              if (form) form.requestSubmit()
            }}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  )
}
