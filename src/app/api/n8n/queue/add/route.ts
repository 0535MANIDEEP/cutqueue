import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.N8N_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { shopId, customerName, customerPhone, serviceType } = await req.json()

  if (!shopId || !customerName || !customerPhone) {
    return NextResponse.json(
      { error: "Missing required fields: shopId, customerName, customerPhone" },
      { status: 400 }
    )
  }

  const shop = await prisma.barberShop.findUnique({
    where: { id: shopId },
    include: { queues: true },
  })

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 })
  }

  let customer = await prisma.user.findFirst({
    where: { phone: customerPhone },
  })

  if (!customer) {
    customer = await prisma.user.create({
      data: {
        name: customerName,
        phone: customerPhone,
        email: `${customerPhone.replace(/\D/g, "")}@cutqueue.local`,
        role: "CUSTOMER",
      },
    })
  }

  const queue = shop.queues[0]
  if (!queue) {
    return NextResponse.json({ error: "No queue found for shop" }, { status: 404 })
  }

  const existingEntry = await prisma.queueEntry.findFirst({
    where: {
      queueId: queue.id,
      customerId: customer.id,
      status: { in: ["WAITING", "CALLED", "IN_PROGRESS"] },
    },
  })

  if (existingEntry) {
    return NextResponse.json({
      success: true,
      ticketNumber: existingEntry.ticketNumber,
      message: "Customer already in queue",
      alreadyInQueue: true,
    })
  }

  const maxTicket = await prisma.queueEntry.aggregate({
    where: { queueId: queue.id },
    _max: { ticketNumber: true },
  })

  const ticketNumber = (maxTicket._max.ticketNumber || queue.currentNumber) + 1

  const entry = await prisma.queueEntry.create({
    data: {
      queueId: queue.id,
      customerId: customer.id,
      ticketNumber,
      serviceType: serviceType || "Haircut",
      status: "WAITING",
    },
  })

  const waitingCount = await prisma.queueEntry.count({
    where: { queueId: queue.id, status: "WAITING" },
  })

  return NextResponse.json({
    success: true,
    ticketNumber: entry.ticketNumber,
    position: waitingCount,
    estimatedWait: waitingCount * 20,
    message: `Added to queue. Ticket #${entry.ticketNumber}. Position: ${waitingCount}. Est. wait: ${waitingCount * 20} min.`,
  })
}
