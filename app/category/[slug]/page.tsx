import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CategoryPageClient } from "@/components/category-page-client"
import { getCategories, getBooksByCategory } from "@/lib/api"
import type { Book, Category } from "@/lib/data"
export const dynamic = "force-dynamic";
export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    return categories.map((cat: Category) => ({ slug: cat.slug }))
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(" Failed to generate static params:", error)
    }
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const categories: Category[] = await getCategories()
    const category = categories.find((cat: Category) => cat.slug === slug)
    
    if (!category) return { title: "Category Not Found - Bookzeno" }

    const categoryName = category.category_name || category.name || "Category"

    return {
      title: `${categoryName} Books - Bookzeno`,
      description:
        category.description ||
        `Browse ${categoryName} books`,
    }
  } catch (error) {
    return { title: "Category - Bookzeno" }
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  try {
    const [categories, categoryBooksRaw] = await Promise.all([
      getCategories() as Promise<Category[]>,
      getBooksByCategory(slug),
    ])

    const category = categories.find((cat: Category) => cat.slug === slug)
    if (!category) notFound()

    // Normalize books so cover image fields are always available
    const categoryBooks: Book[] = (categoryBooksRaw as any[]).map((b: any) => ({
      ...b,
      cover_image: b.cover_image ?? b.cover_image_url ?? b.image,
      cover_image_url: b.cover_image_url ?? b.cover_image ?? b.image,
    }))

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <CategoryPageClient
            category={category}
            books={categoryBooks}
            allCategories={categories}
          />
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(" Error loading category:", error)
    }
    notFound()
  }
}
