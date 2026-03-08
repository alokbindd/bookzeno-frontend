export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
    const url = `${baseUrl}/api/category/${slug}/`
    
    console.log("[v0] Proxy: Fetching books for category:", url)
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      console.error("[v0] Proxy error:", response.status)
      return Response.json({ error: "Failed to fetch category books" }, { status: response.status })
    }
    
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("[v0] Proxy error:", error)
    return Response.json({ error: "Failed to fetch category books" }, { status: 500 })
  }
}
