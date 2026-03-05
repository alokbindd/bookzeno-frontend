import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"
import { FeaturedBooks } from "@/components/featured-books"
import { AllBooks } from "@/components/all-books"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        <FeaturedBooks />
        <AllBooks />
      </main>
      <Footer />
    </div>
  )
}
