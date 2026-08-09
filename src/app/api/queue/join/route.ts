import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { businessId, serviceType } = await req.json()

  const queue = await prisma.queue.findFirst({
    where: { businessId },
    include: {
      entries: {
        where: { status: { in: ["WAITING", "CALLED", "IN_PROGRESS"] } },
      },
    },
  })

  if (!queue) {
    return NextResponse.json({ error: "Queue not found" }, { status: 404 })
  }

  const existingEntry = queue.entries.find(
    (e) => e.customerId === session.user!.id
  )
  if (existingEntry) {
    return NextResponse.json(
      { error: "You are already in this queue" },
      { status: 400 }
    )
  }

  const maxTicket = queue.entries.reduce(
    (max, e) => Math.max(max, e.ticketNumber),
    queue.currentNumber
  )

  const entry = await prisma.queueEntry.create({
    data: {
      queueId: queue.id,
      customerId: session.user.id!,
      ticketNumber: maxTicket + 1,
      serviceType,
      status: "WAITING",
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
