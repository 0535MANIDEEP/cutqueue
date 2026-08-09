import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const shop = await prisma.barberShop.findUnique({
    where: { ownerId: session.user.id },
    include: {
      queues: {
        include: {
          entries: {
            where: { status: { not: "COMPLETED" } },
            orderBy: { ticketNumber: "asc" },
            include: { customer: { select: { name: true, image: true } } },
          },
        },
      },
    },
  })

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 })
  }

  const queue = shop.queues[0]
  const waiting = queue?.entries.filter((e) => e.status === "WAITING") || []
  const called = queue?.entries.filter((e) => e.status === "CALLED") || []
  const inProgress = queue?.entries.filter((e) => e.status === "IN_PROGRESS") || []

  return NextResponse.json({
    shop: { id: shop.id, name: shop.name },
    queue: queue
      ? {
          id: queue.id,
          currentNumber: queue.currentNumber,
          estimatedWait: queue.estimatedWait,
          waiting: waiting.map((e) => ({
            id: e.id,
            ticketNumber: e.ticketNumber,
            name: e.customer.name,
            serviceType: e.serviceType,
            joinedAt: e.joinedAt,
          })),
          called: called.map((e) => ({
            id: e.id,
            ticketNumber: e.ticketNumber,
            name: e.customer.name,
            serviceType: e.serviceType,
          })),
          inProgress: inProgress.map((e) => ({
            id: e.id,
            ticketNumber: e.ticketNumber,
            name: e.customer.name,
            serviceType: e.serviceType,
          })),
        }
      : null,
  })
}
