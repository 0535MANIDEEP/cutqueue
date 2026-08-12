import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requirePermission, Role } from "@/lib/roles"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const permCheck = await requirePermission(session as { user: { role: Role; id: string } }, "service:update")
    if (!permCheck.allowed) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.error === "Unauthorized" ? 401 : 403 })
    }

    const { id } = await params
    const body = await req.json()

    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!business || service.businessId !== business.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const allowedFields = ["name", "description", "duration", "price", "category", "isActive"]
    const updateData: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (updateData.duration !== undefined) {
      const dur = Number(updateData.duration)
      if (isNaN(dur) || dur < 5 || dur > 480) {
        return NextResponse.json({ error: "Duration must be 5-480 minutes" }, { status: 400 })
      }
    }

    if (updateData.price !== undefined) {
      const price = Number(updateData.price)
      if (isNaN(price) || price < 0) {
        return NextResponse.json({ error: "Price must be >= 0" }, { status: 400 })
      }
    }

    const updated = await prisma.service.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error("Service PATCH error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const permCheck = await requirePermission(session as { user: { role: Role; id: string } }, "service:delete")
    if (!permCheck.allowed) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.error === "Unauthorized" ? 401 : 403 })
    }

    const { id } = await params

    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!business || service.businessId !== business.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const hasBookings = await prisma.booking.findFirst({
      where: { serviceId: id, status: { in: ["PENDING", "CONFIRMED"] } },
    })

    if (hasBookings) {
      return NextResponse.json(
        { error: "Cannot delete service with active bookings. Deactivate it instead." },
        { status: 400 }
      )
    }

    await prisma.service.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Service DELETE error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
