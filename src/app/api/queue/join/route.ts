import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { queueJoinSchema } from "@/lib/validation"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
      (e) => e.customerId === session.user.id
    )
    if (existingEntry) {
      return NextResponse.json(
        { error: "You are already in this queue" },
        { status: 400 }
      )
    }

    let entry
    const maxRetries = 5

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const maxTicket = queue.entries.reduce(
          (max, e) => Math.max(max, e.ticketNumber),
          queue.currentNumber
        )

        entry = await prisma.queueEntry.create({
          data: {
            queueId: queue.id,
            customerId: session.user.id,
            ticketNumber: maxTicket + 1 + attempt,
            serviceType,
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

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    logger.error("Route error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
