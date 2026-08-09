import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
        break
      case "start":
        updateData = { status: "IN_PROGRESS", startedAt: new Date() }
        break
      case "complete":
        updateData = { status: "COMPLETED", completedAt: new Date() }
        const waitingCount = await prisma.queueEntry.count({
          where: { queueId: entry.queueId, status: "WAITING" },
        })
        await prisma.queue.update({
          where: { id: entry.queueId },
          data: {
            currentNumber: entry.ticketNumber,
            estimatedWait: waitingCount * 20,
          },
        })
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
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
