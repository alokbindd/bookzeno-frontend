import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"

const _inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Bookzeno - Your Premium Online Bookstore",
  description:
    "Discover your next great read at Bookzeno. Browse thousands of books across fiction, non-fiction, technology, romance, and more.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#4F46E5",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <CartProvider>
          <AuthProvider>{children}</AuthProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
