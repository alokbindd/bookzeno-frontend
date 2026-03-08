"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BookCard } from "@/components/book-card"
import type { Book } from "@/lib/data"
import { searchBooks } from "@/lib/api"

interface SearchResultsClientProps {
  initialQuery: string
}

export function SearchResultsClient({ initialQuery }: SearchResultsClientProps) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = searchParams.get("q") ?? initialQuery ?? ""
    setQuery(q)

    const run = async () => {
      const term = q.trim()
      if (!term) {
        setBooks([])
        return
      }

      setLoading(true)
      setError(null)
      try {
        const results = await searchBooks(term)
        const normalized: Book[] = (results as any[]).map((b: any) => ({
          ...b,
          cover_image: b.cover_image ?? b.cover_image_url ?? b.image,
          cover_image_url: b.cover_image_url ?? b.cover_image ?? b.image,
        }))
        setBooks(normalized)
      } catch (err: any) {
        console.error("[v0] Failed to search books", err)
        setError(
          typeof err?.message === "string"
            ? err.message
            : "Failed to fetch search results."
        )
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [searchParams, initialQuery])

  const hasQuery = query.trim().length > 0

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
          {hasQuery ? `Search results for "${query}"` : "Search"}
        </h1>
        {hasQuery ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Browse books matching your search.
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            Type a keyword in the search bar to find books.
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-destructive">
          {error}
        </div>
      ) : !hasQuery ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Enter a keyword above to start searching for books.
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No books found for your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {books.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      )}
    </section>
  )
}

