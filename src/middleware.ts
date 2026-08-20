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
  "/api/auth/forgot-password": { limit: 3, windowMs: 60000 },
  "/api/auth/reset-password": { limit: 5, windowMs: 60000 },
  "/api/auth/verify-email": { limit: 5, windowMs: 60000 },
  "/api/admin/activate": { limit: 10, windowMs: 60000 },
  "/api/bookings": { limit: 30, windowMs: 60000 },
  "/api/queue": { limit: 20, windowMs: 60000 },
  "/api/queue/join": { limit: 10, windowMs: 60000 },
  "/api/queue/": { limit: 30, windowMs: 60000 },
  "/api/reviews": { limit: 10, windowMs: 60000 },
  "/api/complaints": { limit: 10, windowMs: 60000 },
  "/api/notifications": { limit: 30, windowMs: 60000 },
  "/api/services": { limit: 30, windowMs: 60000 },
  "/api/portfolio": { limit: 20, windowMs: 60000 },
  "/api/admin": { limit: 60, windowMs: 60000 },
  "/api/business/settings": { limit: 20, windowMs: 60000 },
  "/api/staff/schedule": { limit: 20, windowMs: 60000 },
  "/api/onboarding": { limit: 5, windowMs: 60000 },
  "/api/trial": { limit: 30, windowMs: 60000 },
}

function getRateLimitForPath(pathname: string): { limit: number; windowMs: number } | null {
  const sorted = Object.entries(RATE_LIMITS).sort((a, b) => b[0].length - a[0].length)
  for (const [pattern, config] of sorted) {
    if (pathname.startsWith(pattern)) {
      return config
    }
  }
  return null
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  )
  return response
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/")) {
    if (pathname === "/api/health") {
      return addSecurityHeaders(NextResponse.next())
    }

    const rateLimitConfig = getRateLimitForPath(pathname)

    if (rateLimitConfig) {
      const key = getRateLimitKey(request, pathname)
      const { success, remaining } = checkSimpleRateLimit(
        key,
        rateLimitConfig.limit,
        rateLimitConfig.windowMs
      )

      if (!success) {
        const response = NextResponse.json(
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
        return addSecurityHeaders(response)
      }

      const response = NextResponse.next()
      response.headers.set("X-RateLimit-Limit", String(rateLimitConfig.limit))
      response.headers.set("X-RateLimit-Remaining", String(remaining))
      return addSecurityHeaders(response)
    }

    const defaultKey = getRateLimitKey(request, pathname)
    const { success: defaultSuccess, remaining: defaultRemaining } = checkSimpleRateLimit(
      defaultKey,
      60,
      60000
    )
    if (!defaultSuccess) {
      return addSecurityHeaders(
        NextResponse.json({ error: "Too many requests" }, { status: 429 })
      )
    }
    const defaultResponse = NextResponse.next()
    defaultResponse.headers.set("X-RateLimit-Limit", "60")
    defaultResponse.headers.set("X-RateLimit-Remaining", String(defaultRemaining))
    return addSecurityHeaders(defaultResponse)
  }

  return addSecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: "/api/:path*",
}
