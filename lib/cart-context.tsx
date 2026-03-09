"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  getCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  decrementCartItem as apiDecrementCartItem,
  clearCart as apiClearCart,
  APIError,
} from "./api"

export interface CartItem {
  id: number
  book: {
    id: number
    slug: string
    title: string
    price: number
    image?: string
  }
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addToCart: (bookId: number, quantity?: number) => Promise<void>
  removeFromCart: (bookId: number) => Promise<void>
  updateQuantity: (bookId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  resetCartState: () => void
  totalItems: number
  subtotal: number
  tax: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await getCart()
        const raw =
          Array.isArray(response) && response ||
          (Array.isArray(response?.data) && response.data) ||
          (Array.isArray(response?.items) && response.items) ||
          (Array.isArray(response?.data?.items) && response.data.items) ||
          []
        const cartItems: CartItem[] = (raw as any[]).map((item: any) => {
          const bookObj = typeof item.book === "object" && item.book !== null ? item.book : {}
          const bookId =
            (bookObj as any).id ??
            item.book_id ??
            item.book ??
            0
          const bookSlug =
            (bookObj as any).slug ??
            item.book_slug ??
            String(bookId || "")
          const bookTitle =
            (bookObj as any).title ??
            item.book_title ??
            "Unknown title"
          const bookPrice = Number(
            (bookObj as any).price ??
              item.book_price ??
              0
          )

          // Prefer flat book_image from the cart API payload and normalize to absolute URL
          let bookImage: string | undefined =
            item.book_image ??
            (bookObj as any).cover_image ??
            (bookObj as any).image ??
            undefined

          if (bookImage && !bookImage.startsWith("http")) {
            const apiBase =
              process.env.NEXT_PUBLIC_API_BASE_URL 
            bookImage = `${apiBase}${bookImage}`
          }

          return {
            id: item.id,
            book: {
              id: bookId,
              slug: bookSlug,
              title: bookTitle,
              price: bookPrice,
              image: bookImage,
            },
            quantity: item.quantity ?? 0,
          }
        })
        setItems(cartItems)
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(" Failed to load cart", error)
        }
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  const refreshCart = async () => {
    try {
      const response = await getCart()
      const raw =
        Array.isArray(response) && response ||
        (Array.isArray(response?.data) && response.data) ||
        (Array.isArray(response?.items) && response.items) ||
        (Array.isArray(response?.data?.items) && response.data.items) ||
        []
      const cartItems: CartItem[] = (raw as any[]).map((item: any) => {
        const bookObj = typeof item.book === "object" && item.book !== null ? item.book : {}
        const bookId =
          (bookObj as any).id ??
          item.book_id ??
          item.book ??
          0
        const bookSlug =
          (bookObj as any).slug ??
          item.book_slug ??
          String(bookId || "")
        const bookTitle =
          (bookObj as any).title ??
          item.book_title ??
          "Unknown title"
        const bookPrice = Number(
          (bookObj as any).price ??
            item.book_price ??
            0
        )

        // Prefer flat book_image from the cart API payload and normalize to absolute URL
        let bookImage: string | undefined =
          item.book_image ??
          (bookObj as any).cover_image ??
          (bookObj as any).image ??
          undefined

        if (bookImage && !bookImage.startsWith("http")) {
          const apiBase =
            process.env.NEXT_PUBLIC_API_BASE_URL 
          bookImage = `${apiBase}${bookImage}`
        }

        return {
          id: item.id,
          book: {
            id: bookId,
            slug: bookSlug,
            title: bookTitle,
            price: bookPrice,
            image: bookImage,
          },
          quantity: item.quantity ?? 0,
        }
      })
      setItems(cartItems)
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(" Failed to refresh cart", error)
      }
    }
  }

  const addToCart = async (bookId: number, quantity: number = 1) => {
    try {
      await apiAddToCart(bookId, quantity)
      await refreshCart()
    } catch (error) {
      if (error instanceof APIError && error.status === 409) {
        if (typeof window !== "undefined") {
          window.alert("Not enough stock available")
        }
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.error(" Failed to add to cart", error)
        }
      }
      throw error
    }
  }

  const removeFromCart = async (bookId: number) => {
    try {
      await apiRemoveFromCart(bookId)
      await refreshCart()
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(" Failed to remove from cart", error)
      }
      throw error
    }
  }

  const updateQuantity = async (bookId: number, quantity: number) => {
    try {
      const existing = items.find((item) => item.book.id === bookId)
      if (!existing) {
        await refreshCart()
        return
      }

      if (quantity <= 0) {
        await apiRemoveFromCart(bookId)
      } else if (quantity < existing.quantity) {
        const steps = existing.quantity - quantity
        for (let i = 0; i < steps; i++) {
          await apiDecrementCartItem(bookId)
        }
      } else if (quantity > existing.quantity) {
        const steps = quantity - existing.quantity
        for (let i = 0; i < steps; i++) {
          await apiAddToCart(bookId, 1)
        }
      }
      await refreshCart()
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(" Failed to update quantity", error)
      }
      throw error
    }
  }

  const clearCart = async () => {
    try {
      await apiClearCart()
      setItems([])
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(" Failed to clear cart", error)
      }
      throw error
    }
  }

  const resetCartState = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  )
  const tax = subtotal * 0.18
  const total = subtotal + tax

  const value: CartContextType = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    resetCartState,
    totalItems,
    subtotal,
    tax,
    total,
  }

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
