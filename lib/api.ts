// Use Next.js API proxy to avoid CORS issues
const API_BASE_URL = "/api/proxy"

// Helper function to get auth token
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

// Helper function to set auth tokens
export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("access_token", accessToken)
  localStorage.setItem("refresh_token", refreshToken)
}

// Helper function to clear tokens
export function clearAuthTokens() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}

// Centralized fetch with auth header and error handling
async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  let url = `${API_BASE_URL}/${endpoint}`
  
  // On the server, fetch requires absolute URLs
  if (typeof window === "undefined") {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    url = `${baseUrl}${url}`
  }
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    console.log("[v0] API Request:", { url, method: options.method || "GET" })
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // For session-based cart persistence
    })

    console.log("[v0] API Response:", { status: response.status, url })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status !== 404) {
        console.error("[v0] API Error:", { status: response.status, errorData })
      }
      throw {
        status: response.status,
        message: errorData.message || errorData.detail || "API Error",
        data: errorData,
      }
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    if (error.status !== 404) {
      console.error("[v0] API Fetch Error:", { endpoint, error: error.message })
    }
    throw error
  }
}

// ==================== BOOKS ====================
export async function getBooks(page: number = 1, category?: string) {
  let endpoint = `api/books/?page=${page}`
  if (category) {
    endpoint += `&category=${category}`
  }
  return apiFetch(endpoint)
}

export async function getBookBySlug(slug: string) {
  return apiFetch(`api/books/${slug}/`)
}

export async function getBookReviews(slug: string) {
  return apiFetch(`api/books/${slug}/reviews/`)
}

export async function submitBookReview(
  slug: string,
  rating: number,
  comment: string
) {
  return apiFetch(`api/books/${slug}/review/`, {
    method: "POST",
    body: JSON.stringify({ rating, comment }),
  })
}

export async function deleteBookReview(slug: string) {
  return apiFetch(`api/books/${slug}/review/delete/`, {
    method: "DELETE",
  })
}

// ==================== CATEGORIES ====================
export async function getCategories() {
  try {
    // Use the proxy endpoint to avoid CORS issues
    const data = await apiFetch("api/category/")
    console.log("[v0] Categories response:", data)
    
    // Handle different response formats
    if (Array.isArray(data)) {
      console.log("[v0] Categories is an array")
      return data
    } else if (data?.results && Array.isArray(data.results)) {
      console.log("[v0] Categories has results array")
      return data.results
    } else if (data?.data && Array.isArray(data.data)) {
      console.log("[v0] Categories has data array")
      return data.data
    } else {
      console.log("[v0] Unexpected category format:", data)
      return []
    }
  } catch (error: any) {
    console.error("[v0] Failed to fetch categories:", error)
    return []
  }
}

export async function getBooksByCategory(categorySlug: string) {
  try {
    const data = await apiFetch(`api/category/${categorySlug}/`)
    console.log("[v0] Books for category:", categorySlug, data)
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data
    } else if (data?.results && Array.isArray(data.results)) {
      return data.results
    } else if (data?.data && Array.isArray(data.data)) {
      return data.data
    } else if (data?.books && Array.isArray(data.books)) {
      return data.books
    } else {
      return []
    }
  } catch (error: any) {
    console.error("[v0] Failed to fetch books by category:", error)
    return []
  }
}

// ==================== CART ====================
export async function getCart() {
  return apiFetch("api/carts/")
}

export async function addToCart(bookSlug: string, quantity: number = 1) {
  return apiFetch("api/carts/add/", {
    method: "POST",
    body: JSON.stringify({ book: bookSlug, quantity }),
  })
}

export async function updateCartItem(
  cartItemId: string | number,
  quantity: number
) {
  return apiFetch(`api/carts/${cartItemId}/update/`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  })
}

export async function removeFromCart(cartItemId: string | number) {
  return apiFetch(`api/carts/${cartItemId}/delete/`, {
    method: "DELETE",
  })
}

export async function clearCart() {
  return apiFetch("api/carts/clear/", {
    method: "DELETE",
  })
}

// ==================== AUTHENTICATION ====================
export async function loginUser(email: string, password: string) {
  const response = await apiFetch("api/accounts/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  if (response.data?.access && response.data?.refresh) {
    setAuthTokens(response.data.access, response.data.refresh)
  }
  return response
}

export async function registerUser(
  email: string,
  password: string,
  first_name?: string,
  last_name?: string
) {
  return apiFetch("api/accounts/register/", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      first_name: first_name || "",
      last_name: last_name || "",
    }),
  })
}

export async function logoutUser() {
  clearAuthTokens()
  // Optionally call backend logout endpoint
  try {
    await apiFetch("api/accounts/logout/", { method: "POST" })
  } catch {
    // Logout endpoint might not exist, just clear tokens
  }
}

export async function getCurrentUser() {
  try {
    return await apiFetch("api/accounts/me/")
  } catch {
    return null
  }
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token")
  if (!refreshToken) throw new Error("No refresh token")

  const response = await apiFetch("api/accounts/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  })

  if (response.data?.access) {
    localStorage.setItem("access_token", response.data.access)
  }
  return response
}

// ==================== ORDERS ====================
export async function createCheckout(
  shippingAddress: string,
  billingAddress: string,
  paymentMethod: string
) {
  return apiFetch("api/orders/checkout/", {
    method: "POST",
    body: JSON.stringify({
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      payment_method: paymentMethod,
    }),
  })
}

export async function createPayment(orderId: number) {
  return apiFetch(`api/orders/${orderId}/create-payment/`, {
    method: "POST",
  })
}

export async function capturePayment(
  orderId: number,
  paymentId: string,
  payerId: string
) {
  return apiFetch("api/orders/capture-payment/", {
    method: "POST",
    body: JSON.stringify({
      order_id: orderId,
      payment_id: paymentId,
      payer_id: payerId,
    }),
  })
}

export async function getOrders(page?: number) {
  let endpoint = "api/orders/"
  if (page) {
    endpoint += `?page=${page}`
  }
  return apiFetch(endpoint)
}

export async function getOrderByNumber(orderNumber: string) {
  return apiFetch(`api/orders/${orderNumber}/`)
}

// ==================== PAYMENT ====================
export async function getPaymentDetails(paymentId: string) {
  return apiFetch(`api/payments/${paymentId}/`)
}
