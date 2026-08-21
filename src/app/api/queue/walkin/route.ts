import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

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

    const walkInUser = await prisma.user.upsert({
      where: { email: `walkin-${Date.now()}@queue.local` },
      create: {
        email: `walkin-${Date.now()}@queue.local`,
        name: customerName,
        phone: customerPhone || null,
        role: "CUSTOMER",
      },
      update: {},
    })

    const lastEntry = await prisma.queueEntry.findFirst({
      where: { queueId: queue.id },
      orderBy: { ticketNumber: "desc" },
    })

    const ticketNumber = (lastEntry?.ticketNumber ?? 1000) + 1

    const entry = await prisma.queueEntry.create({
      data: {
        queueId: queue.id,
        customerId: walkInUser.id,
        serviceType: serviceType || "General",
        ticketNumber,
        status: "WAITING",
      },
    })

    const waitingCount = await prisma.queueEntry.count({
      where: { queueId: queue.id, status: "WAITING" },
    })

    logger.info("Walk-in added to queue", {
      businessId,
      ticketNumber,
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
