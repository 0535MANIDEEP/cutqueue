import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const bookings = await prisma.booking.findMany({
    where: { customerId: session.user.id },
    include: {
      barber: { include: { user: { select: { name: true, image: true } } } },
      service: true,
      shop: { select: { name: true, address: true } },
    },
    orderBy: { scheduledAt: "desc" },
    take: 20,
  })

  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { barberId, serviceId, shopId, scheduledAt, notes } = await req.json()

  if (!barberId || !serviceId || !shopId || !scheduledAt) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    )
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  })

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  const existingBooking = await prisma.booking.findFirst({
    where: {
      barberId,
      scheduledAt: new Date(scheduledAt),
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  })

  if (existingBooking) {
    return NextResponse.json(
      { error: "Time slot already booked" },
      { status: 400 }
    )
  }

  const booking = await prisma.booking.create({
    data: {
      customerId: session.user.id!,
      barberId,
      serviceId,
      shopId,
      scheduledAt: new Date(scheduledAt),
      duration: service.duration,
      notes,
      status: "PENDING",
    },
  })

  return NextResponse.json(booking, { status: 201 })
}
