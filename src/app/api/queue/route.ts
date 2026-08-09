import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get("businessId")

  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 })
  }

  const queue = await prisma.queue.findFirst({
    where: { businessId },
    include: {
      entries: {
        include: {
          customer: { select: { name: true, phone: true } },
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
  const estimatedWait = waitingCount * 20

  return NextResponse.json({
    queue,
    entries: queue.entries,
    waitingCount,
    estimatedWait,
  })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { businessId, serviceId } = await req.json()

  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 })
  }

  let queue = await prisma.queue.findFirst({
    where: { businessId },
  })

  if (!queue) {
    queue = await prisma.queue.create({
      data: {
        businessId,
        isActive: true,
        maxCapacity: 50,
      },
    })
  }

  if (!queue.isActive) {
    return NextResponse.json({ error: "Queue is closed" }, { status: 400 })
  }

  const existingEntry = await prisma.queueEntry.findFirst({
    where: {
      queueId: queue.id,
      customerId: session.user.id!,
      status: { in: ["WAITING", "CALLED", "IN_PROGRESS"] },
    },
  })

  if (existingEntry) {
    return NextResponse.json({ error: "Already in queue" }, { status: 400 })
  }

  const lastEntry = await prisma.queueEntry.findFirst({
    where: { queueId: queue.id },
    orderBy: { ticketNumber: "desc" },
  })

  const ticketNumber = (lastEntry?.ticketNumber ?? 1000) + 1

  const entry = await prisma.queueEntry.create({
    data: {
      queueId: queue.id,
      customerId: session.user.id!,
      serviceType: serviceId || "General",
      ticketNumber,
      status: "WAITING",
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
