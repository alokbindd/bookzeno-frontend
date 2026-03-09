"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  BookOpen,
  ChevronDown,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { getCategories } from "@/lib/api"
import { Category } from "@/lib/data"

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground font-serif">
            Bookzeno
          </span>
        </Link>
      </div>
    </header>
  )
}

function NavbarInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { totalItems } = useCart()
  const { isAuthenticated, user, logout } = useAuth()

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
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const q = searchParams.get("q") ?? ""
    setSearchTerm(q)
  }, [searchParams])

  const handleSearch = () => {
    const term = searchTerm.trim()
    if (!term) return
    router.push(`/search?q=${encodeURIComponent(term)}`)
    setMobileMenuOpen(false)
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm"
      suppressHydrationWarning
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground font-serif">
            Bookzeno
          </span>
        </Link>

        {/* Search - Desktop */}
        <div className="mx-8 hidden max-w-lg flex-1 md:flex">
          <div className="relative w-full">
            <button
              type="button"
              onClick={handleSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <Input
              type="search"
              placeholder="Search books, authors, genres..."
              className="w-full pl-10 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSearch()
                }
              }}
            />
          </div>
        </div>

        {/* Nav Actions - Desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-foreground hover:text-foreground">
                Categories
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border border-border bg-white text-gray-900 shadow-lg"
            >
              {categories.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500">
                  Loading categories...
                </div>
              ) : (
                <>
                  <DropdownMenuItem
                    className="p-0 focus:bg-gray-100 focus:text-gray-900"
                    asChild
                  >
                    <Link
                      href="/"
                      className="block w-full cursor-pointer px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    >
                      All Books
                    </Link>
                  </DropdownMenuItem>
                  <div className="my-1 border-t border-border/60" />
                  {categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.slug}
                      className="p-0 focus:bg-gray-100 focus:text-gray-900"
                      asChild
                    >
                      <Link
                        href={`/category/${cat.slug}`}
                        className="block w-full cursor-pointer px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                      >
                        {cat.category_name || cat.name || "Category"}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-foreground hover:text-foreground">
                    <User className="mr-1.5 h-4 w-4" />
                    {user.first_name || "Account"}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      logout().finally(() => {
                        window.location.href = "/"
                      })
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-red-600" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild className="text-foreground">
              <Link href="/login">
                <User className="mr-1.5 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="sm" asChild className="relative text-foreground">
            <Link href="/cart">
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              Cart
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-0 text-[9px] text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 md:hidden">
          {/* Mobile Search */}
          <div className="relative my-3">
            <button
              type="button"
              onClick={handleSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <Input
              type="search"
              placeholder="Search books..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSearch()
                }
              }}
            />
          </div>

          <nav className="flex flex-col gap-1">
            <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="rounded-md px-2 py-2 text-sm text-foreground hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <div className="my-2 border-t border-border" />
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/account/dashboard"
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  My Account
                </Link>
                <button
                  onClick={() => {
                    logout().finally(() => {
                      window.location.href = "/"
                    })
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-red-600 hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4 text-red-600" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Login / Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export function Navbar() {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarInner />
    </Suspense>
  )
}
