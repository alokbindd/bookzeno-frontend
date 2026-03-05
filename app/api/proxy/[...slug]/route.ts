const BACKEND_URL = "http://13.201.84.104"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug: slugArray } = await params
  const slug = slugArray.join("/")
  const url = new URL(request.url)
  const queryString = url.search

  const backendUrl = `${BACKEND_URL}/${slug}${queryString}`

  try {
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("[v0] Proxy Error:", error)
    return new Response(JSON.stringify({ error: "Proxy request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug: slugArray } = await params
  const slug = slugArray.join("/")
  const backendUrl = `${BACKEND_URL}/${slug}`
  const body = await request.text()

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: body,
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("[v0] Proxy Error:", error)
    return new Response(JSON.stringify({ error: "Proxy request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug: slugArray } = await params
  const slug = slugArray.join("/")
  const backendUrl = `${BACKEND_URL}/${slug}`
  const body = await request.text()

  try {
    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: body,
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("[v0] Proxy Error:", error)
    return new Response(JSON.stringify({ error: "Proxy request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug: slugArray } = await params
  const slug = slugArray.join("/")
  const backendUrl = `${BACKEND_URL}/${slug}`

  try {
    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
    })

    if (response.status === 204) {
      return new Response(null, {
        status: 204,
        headers: { "Access-Control-Allow-Origin": "*" },
      })
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("[v0] Proxy Error:", error)
    return new Response(JSON.stringify({ error: "Proxy request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
