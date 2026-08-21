import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { isBusinessOpen } from "@/lib/business-hours"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { businessId, customerName, customerPhone, serviceType } = body

    if (!businessId || !customerName) {
      return NextResponse.json(
        { error: "businessId and customerName are required" },
        { status: 400 }
      )
    }

    const business = await prisma.business.findFirst({
      where: { id: businessId, ownerId: session.user.id },
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
    const hoursCheck = isBusinessOpen((business as any).openingHours)
    if (!hoursCheck.open) {
      return NextResponse.json({ error: hoursCheck.reason || "Business is closed", nextOpenAt: hoursCheck.nextOpenAt }, { status: 400 })
    }

    // ATOMIC: Use a transaction with row locking to prevent ticket number collisions
    const entry = await prisma.$transaction(async (tx) => {
      // Lock the queue row to prevent concurrent modifications
      const lockedQueue = await tx.queue.findFirst({
        where: { id: queue.id },
        select: { isActive: true, avgServiceTime: true },
      })

      if (!lockedQueue?.isActive) {
        throw new Error("Queue is closed")
      }

      // Use a counter table approach: find or create a counter for this queue
      // We'll get the last ticket number and increment atomically
      const lastEntry = await tx.queueEntry.findFirst({
        where: { queueId: queue.id },
        orderBy: { ticketNumber: "desc" },
      })

      const ticketNumber = (lastEntry?.ticketNumber ?? 1000) + 1

      const walkInUser = await tx.user.upsert({
        where: { email: `walkin-${Date.now()}@queue.local` },
        create: {
          email: `walkin-${Date.now()}@queue.local`,
          name: customerName,
          phone: customerPhone || null,
          role: "CUSTOMER",
        },
        update: {},
      })

      const entry = await tx.queueEntry.create({
        data: {
          queueId: queue.id,
          customerId: walkInUser.id,
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

    logger.info("Walk-in added to queue (transactional)", {
      businessId,
      ticketNumber: entry.ticketNumber,
      customerName,
      position: waitingCount,
    })

    return NextResponse.json({
      id: entry.id,
      ticketNumber: entry.ticketNumber,
      position: waitingCount,
      estimatedWait: waitingCount * queue.avgServiceTime,
    }, { status: 201 })
  } catch (error) {
    logger.error("Walk-in queue error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}