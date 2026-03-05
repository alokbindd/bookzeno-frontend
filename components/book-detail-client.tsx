"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/star-rating"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import type { Book, Review } from "@/lib/data"

export function BookDetailClient({
  book,
  reviews,
}: {
  book: Book
  reviews: Review[]
}) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [subject, setSubject] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState<number>(0)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  const handleAddToCart = async () => {
    try {
      setLoading(true)
      await addToCart(book.slug, quantity)
    } catch (error) {
      console.error("[v0] Failed to add to cart", error)
    } finally {
      setLoading(false)
    }
  }

  // Cover image handling
  const coverImage =
    // Prefer backend cover_image field
    (book as any).cover_image ||
    // Fallbacks
    book.cover_image_url ||
    book.image ||
    null
  const inStock = book.stock && book.stock > 0
  
  // Ensure price is a number
  const price = typeof book.price === 'string' ? parseFloat(book.price) : book.price
  const discountPrice = book.discount_price 
    ? (typeof book.discount_price === 'string' ? parseFloat(book.discount_price) : book.discount_price)
    : undefined

  // Handle category - backend sends nested object with category_name
  const categorySlug =
    typeof book.category === "string"
      ? book.category
      : (book.category as any)?.slug || "uncategorized"
  const categoryName =
    typeof book.category === "string"
      ? book.category
      : (book.category as any)?.category_name ||
        (book.category as any)?.name ||
        "Uncategorized"

  const averageRating =
    (book as any).average_rating ?? book.rating ?? 0
  const reviewCount =
    (book as any).count_review ?? book.review_count ?? 0

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !reviewText.trim() || rating <= 0) return

    try {
      setSubmitting(true)
      const baseUrl = "http://13.201.84.104"
      const response = await fetch(
        `${baseUrl}/api/books/${book.slug}/review/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject,
            review: reviewText,
            rating,
          }),
        }
      )

      if (!response.ok) {
        console.error("[v0] Failed to submit review", await response.text())
        return
      }

      // Clear form after successful submit
      setSubject("")
      setReviewText("")
      setRating(0)
    } catch (error) {
      console.error("[v0] Error submitting review", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/books" className="hover:text-primary transition-colors">
          All Books
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/category/${categorySlug}`} className="hover:text-primary transition-colors">
          {categoryName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{book.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Book Cover */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[350px] aspect-[7/10] overflow-hidden rounded-lg bg-secondary">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (
                  !target.src.includes(
                    "https://placehold.co/350x500?text=No+Cover"
                  )
                ) {
                  target.src =
                    "https://placehold.co/350x500?text=No+Cover"
                }
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Image
                src="https://placehold.co/350x500?text=No+Cover"
                alt="No cover available"
                fill
                className="object-cover"
              />
            </div>
          )}
          </div>
        </div>

        {/* Book Info */}
        <div className="flex flex-col">
          <Badge variant="secondary" className="w-fit">
            {categoryName}
          </Badge>

          <h1 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">
            {book.title}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            by{" "}
            <span className="font-medium text-foreground">{book.author}</span>
          </p>

          {/* Rating */}
          <div className="mt-4 flex items-center gap-2">
            <StarRating rating={averageRating} size="lg" />
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} (
              {Number(reviewCount || 0).toLocaleString()} reviews)
            </span>
          </div>

          <Separator className="my-5" />

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">
              ${price.toFixed(2)}
            </span>
            {discountPrice && discountPrice < price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  ${discountPrice.toFixed(2)}
                </span>
                <Badge className="bg-primary text-primary-foreground">
                  {Math.round(
                    ((price - discountPrice) / price) *
                      100
                  )}
                  % OFF
                </Badge>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-4">
            {inStock ? (
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                In Stock ({book.stock} available)
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                <XCircle className="h-4 w-4" />
                Out of Stock
              </div>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {inStock && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-r-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="flex h-10 w-12 items-center justify-center text-sm font-medium text-foreground">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-l-none"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button size="lg" className="gap-2" onClick={handleAddToCart} disabled={loading}>
                <ShoppingCart className="h-4 w-4" />
                {loading ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          )}

          <Separator className="my-6" />

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Description
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {book.description}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Customer Reviews
        </h2>

        {/* Existing reviews */}
        {reviews && reviews.length > 0 ? (
          <div className="mt-6 flex flex-col gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {(review.user || "A").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {review.user || "Anonymous"}
                      </p>
                      {review.created_at && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No reviews yet. Be the first to review this book.
          </p>
        )}

        {/* Review form */}
        <div className="mt-10 rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Write a Review
          </h3>
          {isAuthenticated ? (
            <form
              className="mt-4 space-y-4"
              onSubmit={handleSubmitReview}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-foreground">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Great book"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-foreground">
                    Rating
                  </label>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const value = idx + 1
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className="text-xl leading-none"
                        >
                          {value <= rating ? "⭐" : "☆"}
                        </button>
                      )
                    })}
                    {rating > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {rating} / 5
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Review
                </label>
                <textarea
                  className="mt-1 min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this book"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="mt-2"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Login to submit a review.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
