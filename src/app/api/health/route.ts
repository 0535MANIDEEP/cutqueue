import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const checks: Record<string, { status: string; latency?: number }> = {}
  const startTime = Date.now()

  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    checks.database = { status: "ok", latency: Date.now() - dbStart }
  } catch {
    checks.database = { status: "error" }
  }

  const overallStatus = Object.values(checks).every((c) => c.status === "ok")
    ? "healthy"
    : "degraded"

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
      totalLatency: Date.now() - startTime,
    },
    {
      status: overallStatus === "healthy" ? 200 : 503,
    }
  )
}
