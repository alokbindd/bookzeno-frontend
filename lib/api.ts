// Use Next.js API proxy to avoid CORS issues and keep requests same-origin
const API_BASE_URL = "/api/proxy"

// Custom error class for API errors
export class APIError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data: any = {}) {
    super(message)
    this.status = status
    this.data = data
    this.name = "APIError"
  }
}

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

const AUTH_USER_KEY = "auth_user"

export function setStoredUser(user: any) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  } catch {
    // ignore storage failures
  }
}

export function getStoredUser<T = any>(): T | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearStoredUser() {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_USER_KEY)
}

// Centralized fetch with auth header and error handling
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<any> {
  let url = `${API_BASE_URL}/${endpoint}`
  
  // On the server, fetch requires absolute URLs
  if (typeof window === "undefined") {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    url = `${baseUrl}${url}`
  }

  const headers = new Headers(options.headers || {})

  // Only set JSON content type when we're not sending FormData
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const token = getAuthToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  try {
    console.log("[v0] API Request:", { url, method: options.method || "GET" })
    const response = await fetch(url, {
      ...options,
      headers: Object.fromEntries(headers.entries()),
      credentials: "include", // For session-based cart persistence
    })

    console.log("[v0] API Response:", { status: response.status, url })

    // Handle token expiration
    if (response.status === 401 && token && retryCount === 0) {
      console.log("[v0] Token expired, attempting refresh...")
      try {
        await refreshAccessToken()
        // Retry the request with the new token
        return apiFetch(endpoint, options, retryCount + 1)
      } catch (refreshError) {
        console.error("[v0] Token refresh failed:", refreshError)
        // Clear tokens and throw original error
        clearAuthTokens()
        const error = new APIError("Session expired. Please log in again.", 401, {})
        console.error("[v0] API Error:", { status: 401, message: error.message })
        throw error
      }
    }

    if (!response.ok) {
      let errorData: any = {}
      let errorMessage = ""
      const contentType = response.headers.get("content-type")
      
      // Try to parse response body
      let responseText = ""
      try {
        responseText = await response.text()
      } catch (textError) {
        console.error("[v0] Failed to read response text:", textError)
      }

      if (responseText && contentType && contentType.includes("application/json")) {
        try {
          errorData = JSON.parse(responseText)
          errorMessage = errorData.message || errorData.detail || errorData.error || `HTTP ${response.status}`
        } catch (parseError) {
          console.error("[v0] Failed to parse error response as JSON:", parseError)
          console.error("[v0] Response text was:", responseText)
          errorMessage = "Invalid response format from server"
          errorData = { message: errorMessage }
        }
      } else if (responseText) {
        // Non-JSON response (like HTML error page)
        errorMessage = responseText || `HTTP ${response.status}`
        errorData = { message: errorMessage }
        console.error("[v0] Non-JSON error response:", { status: response.status, text: responseText.substring(0, 200) })
      } else {
        // Empty response body
        errorMessage = `HTTP ${response.status} Error`
        errorData = { message: errorMessage }
      }

      if (response.status !== 404) {
        console.error("[v0] API Error:", { 
          status: response.status, 
          endpoint,
          message: errorMessage,
          errorData,
          responseText: responseText.substring(0, 200)
        })
      }
      
      const error = new APIError(errorMessage, response.status, errorData)
      throw error
    }

    // Success response
    let data: any
    const contentType = response.headers.get("content-type")
    
    if (contentType && contentType.includes("application/json")) {
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("[v0] Failed to parse success response as JSON:", parseError)
        data = {}
      }
    } else {
      // Non-JSON success response
      const text = await response.text()
      data = text ? { data: text } : {}
    }
    
    return data
  } catch (error: any) {
    // Re-throw APIError as-is
    if (error instanceof APIError) {
      if (error.status !== 404) {
        console.error("[v0] API Fetch Error:", { endpoint, message: error.message })
      }
      throw error
    }
    
    // Handle other errors
    const message = error?.message || "Unknown error"
    console.error("[v0] API Fetch Error:", { endpoint, message })
    throw new APIError(message, error?.status || 500, error)
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
  subject: string,
  review: string,
  rating: number
) {
  return apiFetch(`api/books/${slug}/review/`, {
    method: "POST",
    body: JSON.stringify({ subject, review, rating }),
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
  // Backend returns an array or { data: [...] }
  return apiFetch("api/carts/")
}

export async function addToCart(bookId: number, quantity: number = 1) {
  return apiFetch("api/carts/add/", {
    method: "POST",
    body: JSON.stringify({ book_id: bookId, quantity }),
  })
}

export async function decrementCartItem(bookId: number) {
  return apiFetch(`api/carts/item/${bookId}/decrement/`, {
    method: "DELETE",
  })
}

export async function removeFromCart(bookId: number) {
  return apiFetch(`api/carts/item/${bookId}/`, {
    method: "DELETE",
  })
}

export async function mergeCart() {
  // Merge guest session cart into authenticated user's cart
  return apiFetch("api/carts/merge/", {
    method: "POST",
  })
}

export async function clearCart() {
  return apiFetch("api/carts/clear/", {
    method: "DELETE",
  })
}

// ==================== AUTHENTICATION & ACCOUNT ====================
export async function loginUser(identifier: string, password: string) {
  // Backend accepts either email or username; decide based on simple heuristic
  const payload: any = { password }
  if (identifier.includes("@")) {
    payload.email = identifier
  } else {
    payload.username = identifier
  }

  const data = await apiFetch("api/accounts/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  // Login endpoint returns raw JWT ({ access, refresh }) without envelope
  const accessToken = (data as any).access ?? (data as any).data?.access
  const refreshToken = (data as any).refresh ?? (data as any).data?.refresh

  if (accessToken && refreshToken) {
    setAuthTokens(accessToken, refreshToken)
  }

  const user = (data as any).user ?? (data as any).data?.user
  if (user) {
    setStoredUser(user)
  }

  return data
}

export async function registerUser(
  email: string,
  password: string,
  first_name?: string,
  last_name?: string,
  username?: string
) {
  return apiFetch("api/accounts/register/", {
    method: "POST",
    body: JSON.stringify({
      username: username || email.split('@')[0], // fallback to email prefix if no username
      email,
      password,
      first_name: first_name || "",
      last_name: last_name || "",
    }),
  })
}

export async function logoutUser() {
  clearAuthTokens()
  clearStoredUser()
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

  const data = await apiFetch("api/accounts/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  })

  const newAccessToken = (data as any).access ?? (data as any).data?.access

  if (newAccessToken) {
    localStorage.setItem("access_token", newAccessToken)
  }
  return data
}

export async function getDashboard() {
  return apiFetch("api/accounts/dashboard/")
}

export interface AccountOrderSummary {
  id: number
  order_number: string
  status: string
  created_at: string
  total?: number
  total_amount?: number
  tax?: number
  tax_amount?: number
  grand_total?: number
  total_with_tax?: number
}

export async function getAccountOrders() {
  // Cursor pagination; first page only for now
  return apiFetch("api/orders/")
}

export interface UserProfile {
  first_name?: string
  last_name?: string
  phone_number?: string
  address_line1?: string
  address_line2?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
  profile_picture?: string
  dashboard?: {
    first_name?: string
    last_name?: string
    username?: string
    email?: string
    profile_picture?: string
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const data = await apiFetch("api/accounts/userprofile/")
    return (data as any).data ?? data
  } catch {
    return null
  }
}

export async function updateUserProfile(formData: FormData): Promise<any> {
  return apiFetch("api/accounts/userprofile/", {
    method: "PATCH",
    body: formData,
  })
}

// ==================== ORDERS & CHECKOUT ====================
export interface CheckoutPayload {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  pincode: string
  country: string
  order_note?: string
}

export interface CheckoutResponse {
  order_id: number
  order_number?: string
  subtotal?: number | string
  tax?: number | string
  grand_total?: number | string
  [key: string]: any
}

export async function createCheckout(
  payload: CheckoutPayload
): Promise<CheckoutResponse> {
  const data = await apiFetch("api/orders/checkout/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return (data as any).data ?? data
}

export interface CreatePaymentResponse {
  paypal_order_id: string
  approval_url: string
  [key: string]: any
}

// Create a PayPal payment for a specific order number
export async function createPayment(
  orderNumber: string
): Promise<CreatePaymentResponse> {
  const data = await apiFetch(`api/orders/${orderNumber}/payment/create/`, {
    method: "POST",
  })
  return (data as any).data ?? data
}

export interface CapturePaymentResponse {
  order_id: number
  [key: string]: any
}

// Capture a PayPal payment after approval
export async function capturePayment(
  paypalOrderId: string
): Promise<CapturePaymentResponse> {
  const data = await apiFetch("api/orders/payment/capture/", {
    method: "POST",
    body: JSON.stringify({
      paypal_order_id: paypalOrderId,
    }),
  })
  return (data as any).data ?? data
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
