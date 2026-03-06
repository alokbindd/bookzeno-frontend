// Backend base URL; use HTTP because the host is exposed over plain HTTP
// in the API docs, and HTTPS may fail due to certificate issues.
const BACKEND_URL = "http://13.201.84.104"

// Helper to safely read and parse response
async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type")
  
  try {
    const responseText = await response.text()
    
    if (!responseText) {
      return { success: false, data: null, text: "", isJson: false }
    }
    
    if (contentType && contentType.includes("application/json")) {
      try {
        const json = JSON.parse(responseText)
        return { success: true, data: json, text: responseText, isJson: true }
      } catch (parseError) {
        console.error("[v0] Proxy: Failed to parse JSON:", parseError)
        return { success: false, data: null, text: responseText, isJson: false }
      }
    } else {
      return { success: false, data: null, text: responseText, isJson: false }
    }
  } catch (readError) {
    console.error("[v0] Proxy: Failed to read response body:", readError)
    return { success: false, data: null, text: "", isJson: false }
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug: slugArray } = await params
  const slug = slugArray.join("/")
  const url = new URL(request.url)
  const queryString = url.search

  // Always send trailing slash to Django-style API to avoid POST→GET redirects
  const backendUrl = `${BACKEND_URL}/${slug}${slug.endsWith("/") ? "" : "/"}${queryString}`

  try {
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
    })

    const parsed = await parseResponseBody(response)
    
    if (parsed.isJson && parsed.data) {
      return new Response(JSON.stringify(parsed.data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    } else if (parsed.text) {
      // Return error text wrapped in JSON
      return new Response(JSON.stringify({ 
        error: parsed.text,
        status: response.status 
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    } else {
      // Empty response
      return new Response(JSON.stringify({ 
        error: `HTTP ${response.status}`,
        status: response.status 
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }
  } catch (error) {
    console.error("[v0] Proxy GET Error:", error)
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
  const backendUrl = `${BACKEND_URL}/${slug}${slug.endsWith("/") ? "" : "/"}`
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

    const parsed = await parseResponseBody(response)
    
    if (parsed.isJson && parsed.data) {
      return new Response(JSON.stringify(parsed.data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    } else if (parsed.text) {
      // Return error text wrapped in JSON
      return new Response(JSON.stringify({ 
        error: parsed.text,
        status: response.status 
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    } else {
      // Empty response
      return new Response(JSON.stringify({ 
        error: `HTTP ${response.status}`,
        status: response.status 
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }
  } catch (error) {
    console.error("[v0] Proxy POST Error:", error)
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
  const backendUrl = `${BACKEND_URL}/${slug}${slug.endsWith("/") ? "" : "/"}`
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

    if (response.status === 204) {
      return new Response(null, {
        status: 204,
        headers: { "Access-Control-Allow-Origin": "*" },
      })
    }

    const parsed = await parseResponseBody(response)
    
    if (parsed.isJson && parsed.data) {
      return new Response(JSON.stringify(parsed.data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    } else if (parsed.text) {
      // Return error text wrapped in JSON
      return new Response(JSON.stringify({ 
        error: parsed.text,
        status: response.status 
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    } else {
      // Empty response
      return new Response(JSON.stringify({ 
        error: `HTTP ${response.status}`,
        status: response.status 
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }
  } catch (error) {
    console.error("[v0] Proxy PUT Error:", error)
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
  const backendUrl = `${BACKEND_URL}/${slug}${slug.endsWith("/") ? "" : "/"}`

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

    const parsed = await parseResponseBody(response)
    
    if (parsed.isJson && parsed.data) {
      return new Response(JSON.stringify(parsed.data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    } else if (parsed.text) {
      // Return error text wrapped in JSON
      return new Response(JSON.stringify({ 
        error: parsed.text,
        status: response.status 
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    } else {
      // Empty response
      return new Response(JSON.stringify({ 
        error: `HTTP ${response.status}`,
        status: response.status 
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }
  } catch (error) {
    console.error("[v0] Proxy DELETE Error:", error)
    return new Response(JSON.stringify({ error: "Proxy request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
