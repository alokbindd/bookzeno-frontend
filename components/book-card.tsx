"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import type { Book } from "@/lib/data"

export function BookCard({ book }: { book: Book }) {
  const { addToCart } = useCart()

  const handleAddToCart = async () => {
    try {
      await addToCart(book.slug, 1)
    } catch (error) {
      console.error("[v0] Failed to add to cart", error)
    }
  }

  // Construct proper image URL from API
  // Backend provides `cover_image` (often an absolute URL); keep fallbacks for flexibility
  let coverImage =
    // Primary: backend `cover_image` field
    book.cover_image ||
    book.cover_image_url ||
    book.image

  // If the image is a relative path, prepend the API base URL
  if (coverImage && !coverImage.startsWith("http")) {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://13.201.84.104"
    coverImage = `${apiBase}${coverImage}`
  }

  // Use placeholder if no image available
  const imageSource =
    coverImage || "https://placehold.co/300x450?text=No+Cover"

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      <Link
        href={`/book/${book.slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-secondary"
      >
        <Image
          src={imageSource}
          alt={`Cover of ${book.title} by ${book.author}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          crossOrigin="anonymous"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement
            if (target.src !== "https://placehold.co/300x450?text=No+Cover") {
              target.src = "https://placehold.co/300x450?text=No+Cover"
            }
          }}
        />
        {book.discount_price && book.discount_price < book.price && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            Sale
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/book/${book.slug}`}>
          <h3 className="text-sm font-semibold leading-tight text-foreground line-clamp-2 hover:text-primary transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">{book.author}</p>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < Math.floor(book.rating || 0)
                  ? "fill-accent text-accent"
                  : "text-border"
              }`}
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">
            ({(book.review_count || 0).toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            ${Number(book.price).toFixed(2)}
          </span>
          {book.discount_price && Number(book.discount_price) < Number(book.price) && (
            <span className="text-sm text-muted-foreground line-through">
              ${Number(book.discount_price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <Button
          size="sm"
          className="mt-3 w-full"
          onClick={handleAddToCart}
          disabled={book.stock === 0}
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
          {book.stock && book.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  )
}
