import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notifyQueueJoined, triggerN8NWebhook } from "@/lib/notify"
import { queueJoinSchema } from "@/lib/validation"
import { logger } from "@/lib/logger"
import { enforceQueueLimits } from "@/lib/trial-enforcement"
import { requirePermission, Role } from "@/lib/roles"
import { isBusinessOpen, startOfTodayIST } from "@/lib/business-hours"

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
            customerId: true,
            customer: { select: { name: true } },
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

    const waitingCount = queue.entries.filter((e) => e.status === "WAITING").length
    const estimatedWait = waitingCount * queue.avgServiceTime
    const businessForStatus = businessId ? await prisma.business.findUnique({ where: { id: businessId }, select: { openingHours: true } }) : null
    const hours = isBusinessOpen(businessForStatus?.openingHours as any)

    return NextResponse.json({
      queue: { id: queue.id, isActive: queue.isActive },
      entries: queue.entries,
      waitingCount,
      estimatedWait,
      hours,
    }, {
      headers: { "Cache-Control": "private, max-age=5, stale-while-revalidate=10" },
    })
  } catch (error) {
    logger.error("Queue GET error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const permCheck = await requirePermission(session as { user: { role: Role; id: string } }, "queue:create")
    if (!permCheck.allowed) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.error === "Unauthorized" ? 401 : 403 })
    }

    const body = await req.json()
    const parsed = queueJoinSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { businessId, serviceType } = parsed.data

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    let queue = await prisma.queue.findFirst({
      where: { businessId },
    })

    if (!queue) {
      queue = await prisma.queue.create({
        data: {
          businessId,
          isActive: true,
          avgServiceTime: 30,
        },
      })
    }

    if (!queue.isActive) {
      return NextResponse.json({ error: "Queue is closed" }, { status: 400 })
    }
    const hoursCheck = isBusinessOpen(business.openingHours as any)
    if (!hoursCheck.open) {
      return NextResponse.json({ error: hoursCheck.reason || "Business is closed", nextOpenAt: hoursCheck.nextOpenAt }, { status: 400 })
    }

    // ATOMIC: Use transaction to prevent ticket number collisions under concurrency
    const entry = await prisma.$transaction(async (tx) => {
      // Lock queue row and check capacity within transaction
      const lockedQueue = await tx.queue.findFirst({
        where: { id: queue.id },
      })

      if (!lockedQueue?.isActive) {
        throw new Error("Queue is closed")
      }

      if (lockedQueue.maxCapacity) {
        const currentCount = await tx.queueEntry.count({
          where: { queueId: lockedQueue.id, status: { in: ["WAITING", "CALLED", "IN_PROGRESS"] } },
        })
        if (currentCount >= lockedQueue.maxCapacity) {
          throw new Error("Queue is full")
        }
      }

      // Check existing entries for this user (within transaction)
      const existingEntry = await tx.queueEntry.findFirst({
        where: {
          queueId: lockedQueue.id,
          customerId: session.user.id,
          status: { in: ["WAITING", "CALLED", "IN_PROGRESS"] },
        },
      })

      if (existingEntry) {
        throw new Error("Already in queue")
      }

      // Daily reset: ticket 1..N per day (psychologically small), not forever-growing
      const todayStart = startOfTodayIST()
      const lastToday = await tx.queueEntry.findFirst({
        where: { queueId: lockedQueue.id, joinedAt: { gte: todayStart } },
        orderBy: { ticketNumber: "desc" },
      })
      const ticketNumber = (lastToday?.ticketNumber ?? 0) + 1

      const entry = await tx.queueEntry.create({
        data: {
          queueId: lockedQueue.id,
          customerId: session.user.id,
          serviceType: serviceType || "General",
          ticketNumber,
          status: "WAITING",
        },
      })

      return entry
    })

    const waitingCount = await prisma.queueEntry.count({
      where: { queueId: queue.id, status: "WAITING" },
    })

    await notifyQueueJoined({
      id: entry.id,
      userId: session.user.id,
      ticketNumber: entry.ticketNumber,
      position: waitingCount,
      estimatedWait: waitingCount * queue.avgServiceTime,
    })

    await triggerN8NWebhook("queue.joined", {
      queueId: queue.id,
      ticketNumber: String(entry.ticketNumber),
      businessId,
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    logger.error("Queue POST error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}