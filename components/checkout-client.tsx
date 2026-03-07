 "use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import {
  APIError,
  CheckoutPayload,
  CheckoutResponse,
  getUserProfile,
  createCheckout,
} from "@/lib/api"

interface CheckoutFormState {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  pincode: string
  country: string
  order_note: string
}

const emptyForm: CheckoutFormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
  order_note: "",
}

export function CheckoutClient() {
  const router = useRouter()
  const { items, subtotal, tax, total } = useCart()
  const [form, setForm] = useState<CheckoutFormState>(emptyForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const profile = await getUserProfile()
        if (!profile || !isMounted) return

        setForm(prev => ({
          ...prev,
          first_name:
            profile.dashboard?.first_name ??
            profile.first_name ??
            prev.first_name,
          last_name:
            profile.dashboard?.last_name ?? profile.last_name ?? prev.last_name,
          email: profile.dashboard?.email ?? prev.email,
          phone_number: profile.phone_number ?? prev.phone_number,
          address_line_1:
            profile.address_line_1 ??
            profile.address_line1 ??
            prev.address_line_1,
          address_line_2:
            profile.address_line_2 ??
            profile.address_line2 ??
            prev.address_line_2,
          city: profile.city ?? prev.city,
          state: profile.state ?? prev.state,
          pincode: profile.pincode ?? prev.pincode,
          country: profile.country ?? prev.country,
        }))
      } catch (error) {
        console.error("[checkout] Failed to load user profile", error)
      }
    }

    void loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleClear = () => {
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.")
      return
    }

    setLoading(true)
    try {
      const payload: CheckoutPayload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        address_line_1: form.address_line_1.trim(),
        address_line_2: form.address_line_2.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country.trim(),
        order_note: form.order_note.trim() || undefined,
      }

      const data: CheckoutResponse = await createCheckout(payload)
      const orderId = Number((data as any).order_id)

      if (!orderId) {
        throw new Error("Checkout succeeded but order_id is missing from response.")
      }

      if (typeof window !== "undefined") {
        try {
          const snapshot = {
            order_id: orderId,
            form,
            subtotal,
            tax,
            total,
          }
          window.sessionStorage.setItem(
            `checkout_order_${orderId}`,
            JSON.stringify(snapshot)
          )
        } catch {
          // ignore storage errors
        }
      }

      router.push(`/payment/${orderId}`)
    } catch (error: any) {
      console.error("[checkout] Failed to place order", error)
      let message = "Failed to place order. Please try again."
      if (error instanceof APIError) {
        message =
          (error.data && (error.data.message || error.data.detail)) ||
          error.message ||
          message
      } else if (typeof error?.message === "string") {
        message = error.message
      }
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
        Checkout
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Shipping / Billing Form */}
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 lg:col-span-2"
        >
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                Billing & Shipping Address
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={form.phone_number}
                  onChange={handleChange}
                  required
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="address_line_1">Address Line 1</Label>
                <Input
                  id="address_line_1"
                  name="address_line_1"
                  value={form.address_line_1}
                  onChange={handleChange}
                  required
                  placeholder="123 Main Street"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="address_line_2">
                  Address Line 2 (optional)
                </Label>
                <Input
                  id="address_line_2"
                  name="address_line_2"
                  value={form.address_line_2}
                  onChange={handleChange}
                  placeholder="Apartment, suite, unit, etc."
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="New York"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  placeholder="NY"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                  placeholder="10001"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  placeholder="United States"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="order_note">Order Note (optional)</Label>
                <Textarea
                  id="order_note"
                  name="order_note"
                  value={form.order_note}
                  onChange={handleChange}
                  placeholder="Add any special instructions for your order"
                  rows={3}
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
        <div className="h-fit rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Order Summary
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {items.map(item => (
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
              <span className="text-muted-foreground">Tax</span>
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
          >
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  )
}

