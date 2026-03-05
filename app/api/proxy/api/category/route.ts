export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://13.201.84.104"
    const url = `${baseUrl}/api/category/`
    
    console.log("[v0] Proxy: Fetching categories from:", url)
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      console.error("[v0] Proxy error:", response.status)
      return Response.json({ error: "Failed to fetch categories" }, { status: response.status })
    }
    
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("[v0] Proxy error:", error)
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
