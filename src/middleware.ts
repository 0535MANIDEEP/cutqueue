import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest, path: string): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  return `${ip}:${path}`
}

function checkSimpleRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: limit - record.count }
}

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/api/auth/signup": { limit: 3, windowMs: 60000 },
  "/api/auth/signin": { limit: 5, windowMs: 60000 },
  "/api/auth/callback": { limit: 10, windowMs: 60000 },
  "/api/bookings": { limit: 30, windowMs: 60000 },
  "/api/queue": { limit: 20, windowMs: 60000 },
  "/api/reviews": { limit: 10, windowMs: 60000 },
  "/api/complaints": { limit: 10, windowMs: 60000 },
  "/api/notifications": { limit: 30, windowMs: 60000 },
  "/api/services": { limit: 30, windowMs: 60000 },
  "/api/portfolio": { limit: 20, windowMs: 60000 },
  "/api/admin": { limit: 60, windowMs: 60000 },
}

function getRateLimitForPath(pathname: string): { limit: number; windowMs: number } | null {
  for (const [pattern, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(pattern)) {
      return config
    }
  }
  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/")) {
    const rateLimitConfig = getRateLimitForPath(pathname)

    if (rateLimitConfig) {
      const key = getRateLimitKey(request, pathname)
      const { success, remaining } = checkSimpleRateLimit(
        key,
        rateLimitConfig.limit,
        rateLimitConfig.windowMs
      )

      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": String(rateLimitConfig.limit),
              "X-RateLimit-Remaining": "0",
              "Retry-After": String(Math.ceil(rateLimitConfig.windowMs / 1000)),
            },
          }
        )
      }

      const response = NextResponse.next()
      response.headers.set("X-RateLimit-Limit", String(rateLimitConfig.limit))
      response.headers.set("X-RateLimit-Remaining", String(remaining))
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
