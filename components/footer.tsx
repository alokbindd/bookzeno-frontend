import Link from "next/link"
import Logo from "@/components/logo"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Logo size={32} />
              <span className="text-lg font-bold font-serif text-foreground">Bookzeno</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your premium destination for books across every genre. Curated
              collections, competitive prices, fast delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Categories
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {[
                { name: "Fiction", slug: "fiction" },
                { name: "Non-Fiction", slug: "non-fiction" },
                { name: "Technology", slug: "technology" },
                { name: "Romance", slug: "romance" },
                { name: "Business", slug: "business" },
                { name: "Science Fiction", slug: "science-fiction" },
              ].map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/category/${item.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Support
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {[
                "Help Center",
                "Order Tracking",
                "Returns & Refunds",
                "Shipping Info",
                "Contact Us",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Company
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {[
                "About Us",
                "Careers",
                "Press",
                "Privacy Policy",
                "Terms of Service",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            {"2026 Bookzeno. All rights reserved. Built with care for book lovers everywhere."}
          </p>
        </div>
      </div>
    </footer>
  )
}
