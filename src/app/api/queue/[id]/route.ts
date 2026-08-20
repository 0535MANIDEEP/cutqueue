import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notifyQueueCalled, triggerN8NWebhook } from "@/lib/notify"
import { logger } from "@/lib/logger"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { action } = await req.json()

    const entry = await prisma.queueEntry.findUnique({
      where: { id },
      include: { queue: { include: { business: true } } },
    })

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    if (entry.queue.business.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    let updateData: Record<string, unknown> = {}

    switch (action) {
      case "call":
        updateData = { status: "CALLED", calledAt: new Date() }
        try {
          await notifyQueueCalled({
            id: entry.id,
            userId: entry.customerId,
            ticketNumber: entry.ticketNumber,
          })
          await triggerN8NWebhook("queue.called", {
            queueId: entry.queueId,
            ticketNumber: String(entry.ticketNumber),
            businessId: entry.queue.businessId,
          })
        } catch (notifyError) {
          logger.error("Failed to send queue notification", { entryId: entry.id }, notifyError as Error)
        }
        break
      case "start":
        updateData = { status: "IN_PROGRESS", startedAt: new Date() }
        break
      case "complete":
        updateData = { status: "COMPLETED", completedAt: new Date() }
        const waitingCount = await prisma.queueEntry.count({
          where: { queueId: entry.queueId, status: "WAITING" },
        })
        const queueData = await prisma.queue.findUnique({
          where: { id: entry.queueId },
          select: { avgServiceTime: true },
        })
        await prisma.queue.update({
          where: { id: entry.queueId },
          data: {
            currentNumber: entry.ticketNumber,
            estimatedWait: waitingCount * (queueData?.avgServiceTime || 20),
          },
        })
        try {
          await triggerN8NWebhook("queue.completed", {
            queueId: entry.queueId,
            ticketNumber: String(entry.ticketNumber),
            businessId: entry.queue.businessId,
          })
        } catch (webhookError) {
          logger.error("Failed to trigger queue completed webhook", { entryId: entry.id }, webhookError as Error)
        }
        break
      case "cancel":
        updateData = { status: "CANCELLED" }
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updated = await prisma.queueEntry.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error("Queue PATCH error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
