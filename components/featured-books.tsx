"use client"

import { useEffect, useState } from "react"
import { BookCard } from "@/components/book-card"
import { getBooks } from "@/lib/api"
import { Book } from "@/lib/data"

export function FeaturedBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedBooks = async () => {
      try {
        const response = await getBooks(1)
        const booksData = response.data?.results || response.results || []
        const normalizedBooks: Book[] = booksData.map((b: any) => ({
          ...b,
          cover_image: b.cover_image ?? b.cover_image_url ?? b.image,
          cover_image_url: b.cover_image_url ?? b.cover_image ?? b.image,
        }))
        // Get first 4 books as featured
        setBooks(normalizedBooks.slice(0, 4))
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(" Failed to load featured books", error)
        }
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedBooks()
  }, [])

  if (loading) {
    return (
      <section id="featured" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            Featured Books
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="featured" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            Featured Books
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hand-picked selections from our editors
          </p>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No featured books available</p>
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
