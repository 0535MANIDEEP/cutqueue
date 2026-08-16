import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const staleThreshold = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    const staleEntries = await prisma.queueEntry.updateMany({
      where: {
        status: { in: ["WAITING", "CALLED"] },
        joinedAt: { lt: staleThreshold },
      },
      data: {
        status: "CANCELLED",
        completedAt: now,
      },
    })

    const staleBookings = await prisma.booking.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
      data: {
        status: "CANCELLED",
      },
    })

    const queues = await prisma.queue.findMany({
      where: { isActive: true },
      select: { id: true, businessId: true },
    })

    let queuesUpdated = 0
    for (const queue of queues) {
      const waitingCount = await prisma.queueEntry.count({
        where: { queueId: queue.id, status: "WAITING" },
      })

      const avgServiceTime = await prisma.queueEntry.aggregate({
        where: {
          queueId: queue.id,
          status: "COMPLETED",
          startedAt: { not: null },
          completedAt: { not: null },
        },
        _avg: {
          ticketNumber: true,
        },
      })

      const avgMinutes = 20

      await prisma.queue.update({
        where: { id: queue.id },
        data: {
          estimatedWait: waitingCount * avgMinutes,
        },
      })

      queuesUpdated++
    }

    logger.info("Queue cleanup completed", {
      staleEntries: staleEntries.count,
      staleBookings: staleBookings.count,
      queuesUpdated,
    })

    return NextResponse.json({
      staleEntries: staleEntries.count,
      staleBookings: staleBookings.count,
      queuesUpdated,
    })
  } catch (error) {
    logger.error("Queue cleanup cron failed", {}, error as Error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}
