import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 })
    }

    const queue = await prisma.queue.findFirst({
      where: { businessId },
      include: {
        entries: {
          where: { status: { in: ["WAITING", "CALLED", "IN_PROGRESS"] } },
          select: {
            id: true,
            ticketNumber: true,
            status: true,
            serviceType: true,
            joinedAt: true,
          },
          orderBy: { ticketNumber: "asc" },
        },
      },
    })

    if (!queue) {
      return NextResponse.json({
        queue: null,
        entries: [],
        waitingCount: 0,
        estimatedWait: 0,
      })
    }

    const entriesWithPosition = queue.entries.map((entry, index) => ({
      ...entry,
      position: entry.status === "WAITING" ? index + 1 : null,
    }))

    const waitingCount = queue.entries.filter((e) => e.status === "WAITING").length
    const estimatedWait = waitingCount * queue.avgServiceTime

    return NextResponse.json({
      queue: { id: queue.id, isActive: queue.isActive },
      entries: entriesWithPosition,
      waitingCount,
      estimatedWait,
      avgServiceTime: queue.avgServiceTime,
    }, {
      headers: { "Cache-Control": "public, max-age=5, stale-while-revalidate=10" },
    })
  } catch (error) {
    logger.error("Public queue GET error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
