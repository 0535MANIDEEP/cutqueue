import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notifyQueueJoined, notifyQueueCalled, triggerN8NWebhook } from "@/lib/notify"
import { queueJoinSchema } from "@/lib/validation"
import { logger } from "@/lib/logger"
import { enforceQueueLimits } from "@/lib/trial-enforcement"
import { requirePermission, Role } from "@/lib/roles"

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
          select: {
            id: true,
            ticketNumber: true,
            status: true,
            serviceType: true,
            joinedAt: true,
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

    return NextResponse.json({
      queue: { id: queue.id, isActive: queue.isActive },
      entries: queue.entries,
      waitingCount,
      estimatedWait,
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
        },
      })
    }

    if (!queue.isActive) {
      return NextResponse.json({ error: "Queue is closed" }, { status: 400 })
    }

    if (queue.maxCapacity) {
      const currentCount = await prisma.queueEntry.count({
        where: { queueId: queue.id, status: { in: ["WAITING", "CALLED", "IN_PROGRESS"] } },
      })
      if (currentCount >= queue.maxCapacity) {
        return NextResponse.json({ error: "Queue is full" }, { status: 400 })
      }
    }

    const trialCheck = await enforceQueueLimits(businessId)
    if (!trialCheck.allowed) {
      return NextResponse.json({ error: trialCheck.error }, { status: 403 })
    }

    const existingEntry = await prisma.queueEntry.findFirst({
      where: {
        queueId: queue.id,
        customerId: session.user.id,
        status: { in: ["WAITING", "CALLED", "IN_PROGRESS"] },
      },
    })

    if (existingEntry) {
      return NextResponse.json({ error: "Already in queue" }, { status: 400 })
    }

    let entry
    const maxRetries = 5

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const lastEntry = await prisma.queueEntry.findFirst({
          where: { queueId: queue.id },
          orderBy: { ticketNumber: "desc" },
        })

        const ticketNumber = (lastEntry?.ticketNumber ?? 1000) + 1

        entry = await prisma.queueEntry.create({
          data: {
            queueId: queue.id,
            customerId: session.user.id,
            serviceType: serviceType || "General",
            ticketNumber,
            status: "WAITING",
          },
        })
        break
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)))
      }
    }

    if (!entry) {
      return NextResponse.json({ error: "Failed to join queue" }, { status: 500 })
    }

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
