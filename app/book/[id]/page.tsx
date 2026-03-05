import { notFound } from "next/navigation"
import { getBookBySlug, getBookReviews } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BookDetailClient } from "@/components/book-detail-client"


export function generateStaticParams() {
  // Return empty array - will use dynamic rendering
  // This prevents trying to generate static params without data
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const book = await getBookBySlug(id)
    if (!book || !book.title) return { title: "Book Not Found - Bookzeno" }
    return {
      title: `${book.title} by ${book.author} - Bookzeno`,
      description: book.description,
    }
  } catch {
    return { title: "Book Not Found - Bookzeno" }
  }
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params
    const book = await getBookBySlug(id)

    if (!book || !book.title) {
      notFound()
    }

    let reviews = []
    try {
      const reviewsResponse = await getBookReviews(id)
      reviews = Array.isArray(reviewsResponse) ? reviewsResponse : reviewsResponse.results || []
    } catch {
      // Reviews might not be available
    }

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <BookDetailClient book={book} reviews={reviews} />
        </main>
        <Footer />
      </div>
    )
  } catch {
    notFound()
  }
}
