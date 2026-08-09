import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const validStatuses = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]
const validPaymentStatuses = ["PENDING", "PAID", "REFUNDED", "FAILED"]

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
        status: true,
        paymentStatus: true,
        notes: true,
        createdAt: true,
        customer: { select: { name: true, email: true } },
        staff: { select: { user: { select: { name: true } } } },
        service: { select: { name: true, price: true } },
        business: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id, status, paymentStatus } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
    }

    const existing = await prisma.booking.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updateData.status = status
    }
    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json({ error: "Invalid payment status" }, { status: 400 })
      }
      updateData.paymentStatus = paymentStatus
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
