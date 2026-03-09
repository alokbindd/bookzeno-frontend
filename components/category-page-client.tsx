"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  BookOpen,
  Lightbulb,
  Cpu,
  Heart,
  TrendingUp,
  Rocket,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookCard } from "@/components/book-card"
import { type Book, type Category } from "@/lib/data"

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Lightbulb,
  Cpu,
  Heart,
  TrendingUp,
  Rocket,
}

type SortOption = "featured" | "price-low" | "price-high" | "rating" | "title"
type StockFilter = "all" | "in-stock" | "on-sale"

interface CategoryPageClientProps {
  category: Category
  books: Book[]
  allCategories: Category[]
}

export function CategoryPageClient({
  category,
  books,
  allCategories,
}: CategoryPageClientProps) {
  const [sortBy, setSortBy] = useState<SortOption>("featured")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")

  const categoryName = category.category_name || category.name || "Category"

  const Icon = iconMap[category.icon || ""] || BookOpen

  const filteredAndSorted = useMemo(() => {
    let result = [...books]

    // Apply stock filter
    if (stockFilter === "in-stock") {
      result = result.filter((b) => (b.stock ?? 0) > 0)
    } else if (stockFilter === "on-sale") {
      result = result.filter(
        (b) =>
          typeof b.discount_price === "number" &&
          typeof b.price === "number" &&
          b.discount_price < b.price
      )
    }

    // Apply sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case "price-high":
        result.sort((a, b) => Number(b.price) - Number(a.price))
        break
      case "rating":
        result.sort(
          (a, b) => (b.rating || 0) - (a.rating || 0)
        )
        break
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "featured":
      default:
        result.sort(() => 0)
        break
    }

    return result
  }, [books, sortBy, stockFilter])

  // Sibling categories (exclude current)
  const siblingCategories = allCategories.filter(
    (c) => c.slug !== category.slug
  )

  return (
    <>
      {/* Hero Banner */}
      <section className="border-b border-border bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link
              href="/"
              className="transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">
              {categoryName}
            </span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
                {categoryName}
              </h1>
              {category.description && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  {category.description}
                </p>
              )}
            
              <p className="mt-3 text-sm font-medium text-primary">
                {(category.count ?? books.length).toLocaleString()} books available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar & Books Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredAndSorted.length}
            </span>{" "}
            {filteredAndSorted.length === 1 ? "book" : "books"}
          </p>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <Select
              value={stockFilter}
              onValueChange={(v) => setStockFilter(v as StockFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="on-sale">On Sale</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOption)}
            >
              <SelectTrigger className="w-[160px]">
                <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Book Grid */}
        {filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
            {filteredAndSorted.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground">
              No books found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSortBy("featured")
                setStockFilter("all")
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>

      {/* Browse Other Categories */}
      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <h2 className="mb-6 font-serif text-xl font-bold text-foreground md:text-2xl">
            Browse Other Categories
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {siblingCategories.map((cat) => {
              const CatIcon = cat.icon ? (iconMap[cat.icon] ?? BookOpen) : BookOpen
              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <CatIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {cat.category_name || cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {(cat.count ?? 0).toLocaleString()} books
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
