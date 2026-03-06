'use client';

import { useEffect, useMemo, useState } from "react"
import { BookCard } from "@/components/book-card"
import type { Book, Category } from "@/lib/data"

type SortOption = "price-low" | "price-high" | "rating" | "newest"

interface PaginatedBooks {
  count: number
  next: string | null
  previous: string | null
  results: Book[]
}

interface BooksPageClientProps {
  initialData: PaginatedBooks
  categories: Category[]
}

export function BooksPageClient({ initialData, categories }: BooksPageClientProps) {
  const [pageData, setPageData] = useState<PaginatedBooks>(initialData)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)
  const [sortBy, setSortBy] = useState<SortOption>("price-low")

  // Fetch books for a given page (all-books mode)
  const fetchPage = async (page: number) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/proxy/api/books/?page=${page}`)
      const data = await res.json()
      const normalizedResults: Book[] = (data.results || []).map((b: any) => ({
        ...b,
        cover_image: b.cover_image ?? b.cover_image_url ?? b.image,
        cover_image_url: b.cover_image_url ?? b.cover_image ?? b.image,
      }))
      setPageData({
        count: data.count ?? 0,
        next: data.next ?? null,
        previous: data.previous ?? null,
        results: normalizedResults,
      })
      setCurrentPage(page)
    } catch (error) {
      console.error("[v0] Failed to load books page", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch books by category (single-page mode)
  const fetchByCategory = async (slug: string | null) => {
    try {
      setLoading(true)
      if (!slug) {
        // Reset to all books, first page
        await fetchPage(1)
        return
      }
      const res = await fetch(`/api/proxy/api/category/${slug}/`)
      const data = await res.json()
      const list: any[] =
        Array.isArray(data)
          ? data
          : data.results || data.data || data.books || []
      const normalizedResults: Book[] = list.map((b: any) => ({
        ...b,
        cover_image: b.cover_image ?? b.cover_image_url ?? b.image,
        cover_image_url: b.cover_image_url ?? b.cover_image ?? b.image,
      }))
      setPageData({
        count: normalizedResults.length,
        next: null,
        previous: null,
        results: normalizedResults,
      })
      setCurrentPage(1)
    } catch (error) {
      console.error("[v0] Failed to load books by category", error)
    } finally {
      setLoading(false)
    }
  }

  // Derived books after filters & sorting
  const filteredAndSorted = useMemo(() => {
    let items = [...pageData.results]

    // Price filter (client-side)
    items = items.filter((b) => {
      const priceNum = typeof b.price === "string" ? parseFloat(b.price) : b.price
      if (minPrice !== undefined && priceNum < minPrice) return false
      if (maxPrice !== undefined && priceNum > maxPrice) return false
      return true
    })

    // Sort
    items.sort((a, b) => {
      const priceA = typeof a.price === "string" ? parseFloat(a.price) : a.price
      const priceB = typeof b.price === "string" ? parseFloat(b.price) : b.price
      const ratingA = (a as any).average_rating ?? a.rating ?? 0
      const ratingB = (b as any).average_rating ?? b.rating ?? 0
      const dateA = a.created_at || (a as any).publication_date || ""
      const dateB = b.created_at || (b as any).publication_date || ""

      switch (sortBy) {
        case "price-low":
          return priceA - priceB
        case "price-high":
          return priceB - priceA
        case "rating":
          return ratingB - ratingA
        case "newest":
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        default:
          return 0
      }
    })

    return items
  }, [pageData.results, minPrice, maxPrice, sortBy])

  const totalPages = Math.max(1, Math.ceil(pageData.count / (pageData.results.length || 1)))

  const handleCategoryChange = async (slug: string | null) => {
    setSelectedCategory(slug)
    setMinPrice(undefined)
    setMaxPrice(undefined)
    if (slug) {
      await fetchByCategory(slug)
    } else {
      await fetchPage(1)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            All Books
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse our complete collection of books.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {pageData.count.toLocaleString()} books available
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="price-low">Price Low → High</option>
            <option value="price-high">Price High → Low</option>
            <option value="rating">Rating</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Filter sidebar */}
        <aside className="w-full md:w-[260px] md:flex-shrink-0">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Filters
            </h3>

            {/* Category filter */}
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Category
              </p>
              <div className="mt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${
                    !selectedCategory
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${
                      selectedCategory === cat.slug
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.category_name || cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Price range
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Min"
                  value={minPrice ?? ""}
                  onChange={(e) =>
                    setMinPrice(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
                <span className="text-xs text-muted-foreground">–</span>
                <input
                  type="number"
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Max"
                  value={maxPrice ?? ""}
                  onChange={(e) =>
                    setMaxPrice(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Books grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No books match the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
              {filteredAndSorted.map((book) => (
                <BookCard key={book.slug} book={book} />
              ))}
            </div>
          )}

          {/* Pagination controls (only when not filtering by category) */}
          {!selectedCategory && (
            <div className="mt-8 flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                disabled={!pageData.previous || currentPage <= 1 || loading}
                onClick={() => fetchPage(Math.max(1, currentPage - 1))}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary hover:text-primary"
              >
                Previous
              </button>
              <span className="text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={!pageData.next || loading}
                onClick={() => fetchPage(currentPage + 1)}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary hover:text-primary"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

