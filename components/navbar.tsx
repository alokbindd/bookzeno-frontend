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
  ChevronDown,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Logo from "@/components/logo"
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
import { useTheme } from "next-themes"

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={50} />
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
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)

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

  useEffect(() => {
    setMounted(true)
  }, [])

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
          <Logo size={50} />
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
              className="w-56 border border-border bg-popover text-popover-foreground shadow-lg"
            >
              {categories.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Loading categories...
                </div>
              ) : (
                <>
                  <DropdownMenuItem
                    className="p-0 focus:bg-accent focus:text-accent-foreground"
                    asChild
                  >
                    <Link
                      href="/"
                      className="block w-full cursor-pointer px-3 py-2 text-sm font-semibold text-popover-foreground hover:bg-accent"
                    >
                      All Books
                    </Link>
                  </DropdownMenuItem>
                  <div className="my-1 border-t border-border/60" />
                  {categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.slug}
                      className="p-0 focus:bg-accent focus:text-accent-foreground"
                      asChild
                    >
                      <Link
                        href={`/category/${cat.slug}`}
                        className="block w-full cursor-pointer px-3 py-2 text-sm text-popover-foreground/90 hover:bg-accent"
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
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
            <button
              type="button"
              className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              onClick={() => setMobileCategoriesOpen((v) => !v)}
            >
              <span>Categories</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  mobileCategoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {mobileCategoriesOpen && (
              <div className="mt-1 space-y-1 rounded-md bg-muted/40 px-1 py-1">
                <Link
                  href="/"
                  className="block rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-secondary"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setMobileCategoriesOpen(false)
                  }}
                >
                  All Books
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="block rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-secondary"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setMobileCategoriesOpen(false)
                    }}
                  >
                    {cat.category_name || cat.name || "Category"}
                  </Link>
                ))}
              </div>
            )}
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
