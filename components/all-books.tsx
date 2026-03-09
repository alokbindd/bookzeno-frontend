"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { BookCard } from "@/components/book-card"
import { getBooks } from "@/lib/api"
import { Book } from "@/lib/data"

export function AllBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await getBooks(1)
        const booksData = response.data?.results || response.results || []
        const normalizedBooks: Book[] = booksData.map((b: any) => ({
          ...b,
          cover_image: b.cover_image ?? b.cover_image_url ?? b.image,
          cover_image_url: b.cover_image_url ?? b.cover_image ?? b.image,
        }))
        setBooks(normalizedBooks)
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(" Failed to load books", error)
        }
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [])

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            All Books
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {[...Array(12)].map((_, i) => (
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
    <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
          All Books
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore our complete collection
        </p>
      </div>

      {books.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No books available</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
            {books.slice(0, 8).map((book) => (
              <BookCard key={book.slug} book={book} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href="/books"
              className="inline-flex items-center rounded-md border border-border bg-card px-5 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
            >
              See All Books
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
