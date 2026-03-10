"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"

export function CartClient() {
  const { items, updateQuantity, removeFromCart, subtotal, tax, total, loading } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout")
      return
    }
    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center lg:px-8">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">
          Your cart is empty
        </h1>
        <p className="mt-2 text-muted-foreground">
          Looks like you haven't added any books yet
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
        Shopping Cart
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"} in your cart
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-lg border border-border bg-card p-4"
            >
              <Link
                href={`/book/${item.book.slug}`}
                className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary"
              >
                {item.book.image ? (
                  <Image
                    src={item.book.image}
                    alt={item.book.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "https://placehold.co/80x112?text=No+Cover"
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <span className="text-xs text-muted-foreground">No image</span>
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/book/${item.book.slug}`}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {item.book.title}
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  {/* Quantity */}
                  <div className="flex items-center rounded-md border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => {
                        if (item.quantity <= 1) {
                          void removeFromCart(item.book.id)
                        } else {
                          void updateQuantity(item.book.id, item.quantity - 1)
                        }
                      }}
                      aria-label="Decrease quantity"
                      disabled={loading}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="flex h-8 w-8 items-center justify-center text-xs font-medium text-foreground">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() =>
                        updateQuantity(item.book.id, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                      disabled={loading}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">
                      ${(item.book.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.book.id)}
                      aria-label={`Remove ${item.book.title}`}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="rounded-lg border border-border bg-card p-6 h-fit sticky top-20">
          <h2 className="text-lg font-semibold text-foreground">
            Order Summary
          </h2>

          <div className="mt-4 flex flex-col gap-3">
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
            className="mt-6 w-full"
            size="lg"
            disabled={loading}
            type="button"
            onClick={handleProceedToCheckout}
          >
            Proceed to Checkout
          </Button>

          <Button
            variant="outline"
            asChild
            className="mt-3 w-full"
            size="sm"
          >
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
