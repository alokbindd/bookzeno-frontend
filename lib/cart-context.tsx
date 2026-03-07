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
          const bookObj = item.book ?? {}
          const bookId =
            bookObj.id ??
            item.book_id ??
            item.book ??
            0
          const bookSlug =
            bookObj.slug ??
            item.book_slug ??
            String(bookId || "")
          const bookTitle =
            bookObj.title ??
            item.book_title ??
            "Unknown title"
          const bookPrice = Number(
            bookObj.price ??
              item.book_price ??
              0
          )
          const bookImage =
            bookObj.cover_image ??
            bookObj.image ??
            item.book_image ??
            undefined

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
        console.error("[v0] Failed to load cart", error)
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
        const bookObj = item.book ?? {}
        const bookId =
          bookObj.id ??
          item.book_id ??
          item.book ??
          0
        const bookSlug =
          bookObj.slug ??
          item.book_slug ??
          String(bookId || "")
        const bookTitle =
          bookObj.title ??
          item.book_title ??
          "Unknown title"
        const bookPrice = Number(
          bookObj.price ??
            item.book_price ??
            0
        )
        const bookImage =
          bookObj.cover_image ??
          bookObj.image ??
          item.book_image ??
          undefined

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
      console.error("[v0] Failed to refresh cart", error)
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
        console.error("[v0] Failed to add to cart", error)
      }
      throw error
    }
  }

  const removeFromCart = async (bookId: number) => {
    try {
      await apiRemoveFromCart(bookId)
      await refreshCart()
    } catch (error) {
      console.error("[v0] Failed to remove from cart", error)
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
      console.error("[v0] Failed to update quantity", error)
      throw error
    }
  }

  const clearCart = async () => {
    try {
      await apiClearCart()
      setItems([])
    } catch (error) {
      console.error("[v0] Failed to clear cart", error)
      throw error
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  )
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const value: CartContextType = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
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
