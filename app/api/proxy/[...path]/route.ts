import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://13.201.84.104"

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const slug = Array.isArray(path) ? path.join("/") : path

  const requestUrl = new URL(request.url)
  const basePath = slug.endsWith("/") ? slug : `${slug}/`
  const targetUrl = `${BACKEND_URL}/${basePath}${requestUrl.search}`

  const headers = new Headers(request.headers)

  // Ensure cookies and auth are forwarded; `credentials: "include"` on the
  // client makes the browser send cookies to this proxy, and we just pass
  // them through to the backend.
  // Strip headers that can cause issues when re-sending the request.
  headers.delete("host")
  headers.delete("content-length")

  let body: BodyInit | undefined

  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentType = request.headers.get("content-type") || ""
    if (contentType.includes("multipart/form-data")) {
      body = await request.arrayBuffer()
    } else {
      body = await request.text()
    }
  }

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    redirect: "manual",
    body,
  })

  // Pass through status, headers (including Set-Cookie), and body
  const responseHeaders = new Headers(backendResponse.headers)

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const OPTIONS = proxy

