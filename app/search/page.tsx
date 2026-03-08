import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SearchResultsClient } from "@/components/search-results-client"

export const metadata: Metadata = {
  title: "Search Books - Bookzeno",
}

interface SearchPageProps {
  searchParams: { q?: string }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const initialQuery = typeof searchParams.q === "string" ? searchParams.q : ""

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

