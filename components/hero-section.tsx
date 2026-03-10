import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-foreground">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-books.jpg"
          alt=""
          fill
          className="object-cover opacity-40 dark:opacity-100"
          priority
        />
        <div className="absolute inset-0 bg-foreground/10 dark:bg-black/60" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center lg:px-8 lg:py-32">
        <span className="mb-4 inline-block rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary-foreground">
          New Arrivals This Week
        </span>
        <h1 className="max-w-3xl text-balance font-serif text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
          Discover Your Next Great Read
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/80 md:text-lg">
          Explore curated collections of bestsellers, hidden gems, and timeless
          classics. Free shipping on orders over $35.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild className="gap-2">
            <Link href="/books">
              Browse Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
