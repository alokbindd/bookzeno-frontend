// TypeScript interfaces for API responses
// All actual data is now fetched from the live API at http://13.201.84.104/

import { getCategories as fetchCategories, getBooksByCategory as fetchBooksByCategory } from "@/lib/api"

export interface Book {
  id?: number
  slug: string
  title: string
  author: string
  description: string
  price: number
  discount_price?: number
  category: string
  rating?: number
  review_count?: number
  average_rating?: number
  count_review?: number
  stock?: number
  image?: string
  // Backend may provide `cover_image`; keep `cover_image_url` for legacy compatibility
  cover_image?: string
  cover_image_url?: string
  created_at?: string
  updated_at?: string
}

export interface Category {
  id?: number
  // Backend uses `category_name`; keep `name` for flexibility/legacy data
  name?: string
  category_name?: string
  slug: string
  description?: string
  icon?: string
  count?: number
}

export interface CartItem {
  id: number
  book: {
    slug: string
    title: string
    price: number
    image?: string
  }
  quantity: number
}

export interface Review {
  id?: number
  user?: string
  rating: number
  comment: string
  created_at?: string
  updated_at?: string
}

// ==================== CATEGORY HELPERS ====================
// Re-export API functions for convenience
export { getCategories as fetchCategories } from "@/lib/api"

export function getCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug)
}

export async function getBooksByCategory(slug: string): Promise<Book[]> {
  try {
    const data = await fetchBooksByCategory(slug)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("[v0] Failed to get books by category:", error)
    return []
  }
}

export interface Order {
  id: number
  order_number: string
  status: string
  total_amount: number
  created_at: string
  items: OrderItem[]
  shipping_address?: string
}

export interface OrderItem {
  id: number
  book: {
    title: string
    slug: string
    price: number
  }
  quantity: number
  price: number
}

export interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  is_authenticated?: boolean
}

export interface PaginatedResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

export interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
}

// Utility function to get category slug from category name
export function getCategorySlug(categoryName: string): string {
  return categoryName.toLowerCase().replace(/\s+/g, "-")
}

// Utility function to format price
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

// Utility function to get sale badge info
export function getSaleBadgeInfo(
  price: number,
  discountPrice?: number
): { show: boolean; percentage: number } {
  if (!discountPrice || discountPrice >= price) {
    return { show: false, percentage: 0 }
  }
  const percentage = Math.round(((price - discountPrice) / price) * 100)
  return { show: true, percentage }
}

// Utility function to calculate tax (8% sales tax)
export function calculateTax(subtotal: number): number {
  return subtotal * 0.08
}

// Utility function to get status badge color
export function getStatusBadgeColor(status: string): string {
  const statusLower = status.toLowerCase()
  if (statusLower.includes("pending")) return "bg-yellow-100 text-yellow-800"
  if (statusLower.includes("processing")) return "bg-blue-100 text-blue-800"
  if (statusLower.includes("shipped")) return "bg-purple-100 text-purple-800"
  if (statusLower.includes("delivered")) return "bg-green-100 text-green-800"
  if (statusLower.includes("cancelled")) return "bg-red-100 text-red-800"
  return "bg-gray-100 text-gray-800"
}

// Default categories (will be fetched from API in components)
export const DEFAULT_CATEGORIES: Category[] = [
  { name: "Fiction", slug: "fiction" },
  { name: "Non-Fiction", slug: "non-fiction" },
  { name: "Technology", slug: "technology" },
  { name: "Romance", slug: "romance" },
  { name: "Business", slug: "business" },
  { name: "Science Fiction", slug: "science-fiction" },
]
