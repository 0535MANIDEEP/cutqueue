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

    const { entryId } = await req.json()

    if (!entryId) {
      return NextResponse.json({ error: "entryId required" }, { status: 400 })
    }

    const entry = await prisma.queueEntry.findUnique({
      where: { id: entryId },
    })

    if (!entry) {
      return NextResponse.json({ error: "Queue entry not found" }, { status: 404 })
    }

    if (entry.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!["WAITING", "CALLED"].includes(entry.status)) {
      return NextResponse.json({ error: "Cannot leave queue in current status" }, { status: 400 })
    }

    await prisma.queueEntry.update({
      where: { id: entryId },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Queue leave error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
