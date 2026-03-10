"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { LayoutDashboard, Lock, User, ShoppingBag, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const sidebarItems = [
  { label: "Dashboard", href: "/account/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/account/orders", icon: ShoppingBag },
  { label: "Security", href: "/account/security", icon: Lock },
  { label: "Profile", href: "/account/profile", icon: User },
]

export function AccountLayoutClient({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex max-w-7xl flex-1 flex-col px-4 py-8 lg:px-8">
          {/* Mobile toggle */}
          <button
            type="button"
            className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <User className="h-4 w-4" />
            Account Menu
          </button>

          <div className="flex flex-1 gap-6">
            {/* Sidebar - desktop */}
            <aside className="hidden w-64 shrink-0 rounded-lg border border-border bg-card p-4 shadow-sm lg:block">
              <nav className="space-y-1 text-sm">
                {sidebarItems.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </nav>
            </aside>

            {/* Content */}
            <section className="flex-1">
              {children}
            </section>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div
              className="h-full w-full bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col rounded-r-2xl border-r border-border bg-card p-4 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Account</span>
                </div>
                <button
                  type="button"
                  className="text-xs text-muted-foreground"
                  onClick={() => setSidebarOpen(false)}
                >
                  Close
                </button>
              </div>
              <nav className="space-y-1 text-sm">
                {sidebarItems.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <button
                  type="button"
                  onClick={async () => {
                    await handleLogout()
                    setSidebarOpen(false)
                  }}
                  className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </nav>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

