import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
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
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id, status, paymentStatus } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
    },
  })

  return NextResponse.json(booking)
}
