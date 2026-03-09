export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
    const url = `${baseUrl}/api/category/`
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.error(" Proxy error:", response.status)
      }
      return Response.json({ error: "Failed to fetch categories" }, { status: response.status })
    }
    
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(" Proxy error:", error)
    }
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
