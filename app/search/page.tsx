import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SearchResultsClient } from "@/components/search-results-client"

export const metadata: Metadata = {
  title: "Search Books - Bookzeno",
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const initialQuery =
    typeof q === "string" ? q : Array.isArray(q) ? q[0] ?? "" : ""

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <SearchResultsClient initialQuery={initialQuery} />
      </main>
      <Footer />
    </div>
  )
}

