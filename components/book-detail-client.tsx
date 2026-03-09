"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/star-rating"
import { InteractiveStarRating } from "@/components/interactive-star-rating"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { getBookReviews, submitBookReview, APIError } from "@/lib/api"
import type { Book, Review } from "@/lib/data"

const REVIEW_LINE_LIMIT = 4

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false)
  const text = review.review ?? review.comment ?? ""
  const lineCount = text.split("\n").length
  const hasLongContent = lineCount > REVIEW_LINE_LIMIT || text.length > 250
  const displayNameRaw =
    review.reviewer_name ??
    review.user_name ??
    review.user ??
    "Anonymous"
  const displayName = displayNameRaw.trim() || review.user || "Anonymous"

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-foreground">{displayName}</p>
            <StarRating rating={review.rating} size="sm" />
          </div>
          {review.subject && (
            <p className="mt-1 text-sm font-medium text-foreground">
              {review.subject}
            </p>
          )}
          <p
            className={`mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap ${
              !expanded && hasLongContent ? "line-clamp-4" : ""
            }`}
          >
            {text}
          </p>
          {hasLongContent && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show more
                </>
              )}
            </button>
          )}
          {review.created_at && (
            <p className="mt-3 text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function BookDetailClient({
  book,
  reviews: initialReviews,
}: {
  book: Book
  reviews: Review[]
}) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [subject, setSubject] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState<number>(0)
  const [successMessage, setSuccessMessage] = useState("")
  const [purchaseRequired, setPurchaseRequired] = useState(false)
  const [locked, setLocked] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { addToCart } = useCart()
  const { isAuthenticated, user } = useAuth()

  // Sync initial reviews
  useEffect(() => {
    setReviews(initialReviews)
  }, [initialReviews])

  // Pre-fill form if user already reviewed
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLocked(false)
      setIsEditing(false)
      return
    }
    if (reviews.length === 0) {
      setLocked(false)
      setIsEditing(false)
      return
    }

    const possibleUsername =
      (user as any).username ||
      user.email?.split("@")[0] ||
      ""
    const userReview = reviews.find((r) => {
      const reviewUser = (r as any)?.user
      if (typeof reviewUser === "string" && possibleUsername) {
        return reviewUser === possibleUsername
      }
      return false
    })
    if (userReview) {
      setSubject(userReview.subject ?? "")
      setReviewText(userReview.review ?? userReview.comment ?? "")
      setRating(userReview.rating ?? 0)
      setLocked(true)
      setIsEditing(false)
    } else {
      setLocked(false)
      setIsEditing(false)
    }
  }, [isAuthenticated, user, reviews])

  const loadReviews = async () => {
    try {
      const data = await getBookReviews(book.slug)
      const list = Array.isArray(data) ? data : (data?.data ?? data?.results ?? [])
      setReviews(list)
    } catch {
      setReviews([])
    }
  }

  const handleAddToCart = async () => {
    try {
      setLoading(true)
      if (!book.id) {
        if (process.env.NODE_ENV !== "production") {
          console.error(" Missing book id for cart add", book)
        }
        return
      }
      await addToCart(book.id, quantity)
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(" Failed to add to cart", error)
      }
    } finally {
      setLoading(false)
    }
  }

  const coverImage =
    (book as any).cover_image ||
    book.cover_image_url ||
    book.image ||
    null
  const inStock = book.stock && book.stock > 0

  const price = typeof book.price === "string" ? parseFloat(book.price) : book.price
  const discountPrice = book.discount_price
    ? typeof book.discount_price === "string"
      ? parseFloat(book.discount_price)
      : book.discount_price
    : undefined

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

  const averageRating = (book as any).average_rating ?? book.rating ?? 0
  const reviewCount = (book as any).count_review ?? book.review_count ?? 0

  const formLocked = locked && !isEditing

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) return
    if (formLocked) return
    if (!subject.trim() || !reviewText.trim() || rating <= 0) return

    const wasUpdate = isEditing
    try {
      setSubmitting(true)
      setPurchaseRequired(false)
      setSuccessMessage("")
      await submitBookReview(book.slug, subject.trim(), reviewText.trim(), rating)
      await loadReviews()
      setSuccessMessage(wasUpdate ? "Review updated successfully." : "Review submitted successfully.")
      setLocked(true)
      setIsEditing(false)
    } catch (error) {
      if (error instanceof APIError && error.status === 403) {
        setPurchaseRequired(true)
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.error(" Error submitting review", error)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setLocked(false)
    setSuccessMessage("")
  }

  // Newest reviews first
  const sortedReviews = [...reviews].sort((a, b) => {
    const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
    const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
    return bDate - aDate
  })

  const computedCount = sortedReviews.length
  const computedAverage =
    computedCount > 0
      ? sortedReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / computedCount
      : 0
  const customerAverage = computedCount > 0 ? computedAverage : Number(averageRating || 0)
  const customerCount = computedCount > 0 ? computedCount : Number(reviewCount || 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/books" className="hover:text-primary transition-colors">
          All Books
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/category/${categorySlug}`}
          className="hover:text-primary transition-colors"
        >
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
                  if (!target.src.includes("https://placehold.co/350x500?text=No+Cover")) {
                    target.src = "https://placehold.co/350x500?text=No+Cover"
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
            by <span className="font-medium text-foreground">{book.author}</span>
          </p>

          <div className="mt-4 flex items-center gap-2">
            <StarRating rating={averageRating} size="lg" />
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} (
              {Number(reviewCount || 0).toLocaleString()} reviews)
            </span>
          </div>

          <Separator className="my-5" />

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
                  {Math.round(((price - discountPrice) / price) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>

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
              <Button
                size="lg"
                className="gap-2"
                onClick={handleAddToCart}
                disabled={loading}
              >
                <ShoppingCart className="h-4 w-4" />
                {loading ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          )}

          <Separator className="my-6" />

          <div>
            <h2 className="text-lg font-semibold text-foreground">Description</h2>
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
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <StarRating rating={customerAverage} size="default" />
          <span className="font-medium text-foreground">
            {Number(customerAverage || 0).toFixed(1)}
          </span>
          <span>
            ({Number(customerCount || 0).toLocaleString()} reviews)
          </span>
        </div>

        {/* Write Review Form - Always visible */}
        <div
          className={`mt-6 rounded-lg border border-border bg-card p-6 shadow-sm ${formLocked ? "cursor-not-allowed" : ""}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-foreground">Write a Review</h3>
            {isAuthenticated && locked && !purchaseRequired && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer shrink-0"
                onClick={handleEditClick}
              >
                Edit
              </Button>
            )}
          </div>
          <form
            className={`mt-4 space-y-4 ${formLocked ? "pointer-events-none" : ""}`}
            onSubmit={handleSubmitReview}
          >
            <div className={formLocked ? "cursor-not-allowed" : ""}>
              <label className="block text-sm font-medium text-foreground">
                Subject
              </label>
              <input
                type="text"
                className={`mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${formLocked ? "cursor-not-allowed bg-muted/50" : ""}`}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Great book"
                disabled={!isAuthenticated ? false : formLocked}
                readOnly={formLocked}
              />
            </div>
            <div className={formLocked ? "cursor-not-allowed" : ""}>
              <label className="block text-sm font-medium text-foreground">
                Rating
              </label>
              <div className="mt-2">
                {formLocked ? (
                  <StarRating rating={rating} size="default" />
                ) : (
                  <InteractiveStarRating
                    value={rating}
                    onChange={setRating}
                    size="default"
                    disabled={!isAuthenticated}
                  />
                )}
                {rating > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {rating} / 5
                  </span>
                )}
              </div>
            </div>
            <div className={formLocked ? "cursor-not-allowed" : ""}>
              <label className="block text-sm font-medium text-foreground">
                Review
              </label>
              <textarea
                className={`mt-1 min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${formLocked ? "cursor-not-allowed bg-muted/50" : ""}`}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this book"
                disabled={!isAuthenticated ? false : formLocked}
                readOnly={formLocked}
              />
            </div>

            {isAuthenticated ? (
              !purchaseRequired ? (
                <div className={formLocked ? "cursor-not-allowed" : "pointer-events-auto"}>
                  {formLocked ? (
                    <Button type="button" disabled className="mt-2 cursor-not-allowed">
                      Submit Review
                    </Button>
                  ) : (
                    <Button type="submit" disabled={submitting} className="mt-2">
                      {submitting
                        ? "Submitting..."
                        : isEditing
                          ? "Update Review"
                          : "Submit Review"}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm font-medium text-red-600">
                  You must purchase this product to post review.
                </p>
              )
            ) : (
              <p className="mt-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Login to post a review
                </Link>
              </p>
            )}

            {successMessage && (
              <p className="text-sm font-medium text-emerald-600">
                {successMessage}
              </p>
            )}
          </form>
        </div>

        {/* Reviews list - below form */}
        <div className="mt-10">
          {sortedReviews.length > 0 ? (
            <div className="flex flex-col gap-6">
              {sortedReviews.map((review) => (
                <ReviewCard key={review.id ?? `${review.user}-${review.created_at}`} review={review} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No reviews yet. Be the first to review this book.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
