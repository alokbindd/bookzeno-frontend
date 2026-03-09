"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  BookOpen,
  Lightbulb,
  Cpu,
  Heart,
  TrendingUp,
  Rocket,
  Atom,
  Landmark,
  Briefcase,
  Baby,
} from "lucide-react"
import { getCategories } from "@/lib/api"
import { Category } from "@/lib/data"

// Map category names to appropriate icons based on document requirements
const getIconForCategory = (name?: string | null): React.ElementType => {
  if (!name || typeof name !== "string") {
    return BookOpen
  }
  
  const nameUpper = name.toUpperCase()
  
  // Document mappings
  if (nameUpper.includes("FICTION")) return BookOpen
  if (nameUpper.includes("SCIENCE")) return Atom
  if (nameUpper.includes("TECHNOLOGY") || nameUpper.includes("TECH")) return Cpu
  if (nameUpper.includes("HISTORY")) return Landmark
  if (nameUpper.includes("BUSINESS")) return Briefcase
  if (nameUpper.includes("CHILDREN") || nameUpper.includes("KIDS")) return Baby
  
  // Additional mappings for common variations
  if (nameUpper.includes("ROMANCE") || nameUpper.includes("LOVE")) return Heart
  if (nameUpper.includes("MOTIVATION") || nameUpper.includes("SELF-HELP")) return TrendingUp
  if (nameUpper.includes("FANTASY") || nameUpper.includes("ADVENTURE")) return Rocket
  if (nameUpper.includes("WISDOM") || nameUpper.includes("PHILOSOPHY")) return Lightbulb
  
  return BookOpen
}

export function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories()
        
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData)
        } else if (categoriesData?.data && Array.isArray(categoriesData.data)) {
          setCategories(categoriesData.data)
        } else if (categoriesData?.results && Array.isArray(categoriesData.results)) {
          setCategories(categoriesData.results)
        } else {
          setCategories([])
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(" Failed to load categories:", error)
        }
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            Browse by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
          Browse by Category
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Find your perfect book in our curated categories
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No categories available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5">
          {categories.filter(cat => cat && cat.slug).map((category) => {
            const categoryName = category.category_name || category.name || "Category"
            const categorySlug = category.slug || ""
            const Icon = getIconForCategory(categoryName)
            
            if (!categorySlug) return null
            
            return (
              <Link
                key={categorySlug}
                href={`/category/${categorySlug}`}
                className="group flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-gradient-to-br from-card to-card/80 p-6 text-center transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary transition-all duration-300 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {categoryName}
                  </h3>
                  {category.count && (
                    <p className="text-xs text-muted-foreground">
                      {Number(category.count).toLocaleString()} {Number(category.count) === 1 ? "book" : "books"}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
