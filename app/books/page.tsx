import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BooksPageClient } from "@/components/books-page-client"
import { getBooks, getCategories } from "@/lib/api"
import type { Book, Category, PaginatedResponse } from "@/lib/data"
export const dynamic = "force-dynamic"

export default async function AllBooksPage() {
  // Load only the first page initially for performance
  const raw = await getBooks(1)

  const results: Book[] = (raw.results || raw.data?.results || []).map(
    (b: any) => ({
      ...b,
      cover_image: b.cover_image ?? b.cover_image_url ?? b.image,
      cover_image_url: b.cover_image_url ?? b.cover_image ?? b.image,
    })
  )

  const initialData: { count: number; next: string | null; previous: string | null; results: Book[] } = {
    count: raw.count ?? raw.data?.count ?? results.length,
    next: raw.next ?? raw.data?.next ?? null,
    previous: raw.previous ?? raw.data?.previous ?? null,
    results,
  }

  const categories: Category[] = await getCategories()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <BooksPageClient initialData={initialData} categories={categories} />
      </main>
      <Footer />
    </div>
  )
}

