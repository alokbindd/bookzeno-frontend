"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  getCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  updateCartItem as apiUpdateCartItem,
  clearCart as apiClearCart,
} from "./api"

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

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addToCart: (bookSlug: string, quantity?: number) => Promise<void>
  removeFromCart: (cartItemId: number) => Promise<void>
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>
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
        const cartItems = response.data?.items || response.items || []
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
      const cartItems = response.data?.items || response.items || []
      setItems(cartItems)
    } catch (error) {
      console.error("[v0] Failed to refresh cart", error)
    }
  }

  const addToCart = async (bookSlug: string, quantity: number = 1) => {
    try {
      await apiAddToCart(bookSlug, quantity)
      await refreshCart()
    } catch (error) {
      console.error("[v0] Failed to add to cart", error)
      throw error
    }
  }

  const removeFromCart = async (cartItemId: number) => {
    try {
      await apiRemoveFromCart(cartItemId)
      await refreshCart()
    } catch (error) {
      console.error("[v0] Failed to remove from cart", error)
      throw error
    }
  }

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId)
      } else {
        await apiUpdateCartItem(cartItemId, quantity)
        await refreshCart()
      }
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
