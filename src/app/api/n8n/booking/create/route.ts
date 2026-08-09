import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.N8N_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { shopId, customerName, customerPhone, serviceId, date, time } = await req.json()

  if (!shopId || !customerName || !customerPhone || !serviceId || !date || !time) {
    return NextResponse.json(
      { error: "Missing required fields: shopId, customerName, customerPhone, serviceId, date, time" },
      { status: 400 }
    )
  }

  const business = await prisma.business.findUnique({ where: { id: shopId } })
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  let customer = await prisma.user.findFirst({
    where: { phone: customerPhone },
  })

  if (!customer) {
    customer = await prisma.user.create({
      data: {
        name: customerName,
        phone: customerPhone,
        email: `${customerPhone.replace(/\D/g, "")}@queueforge.local`,
        role: "CUSTOMER",
      },
    })
  }

  const scheduledAt = new Date(`${date}T${time}:00`)

  const existingBooking = await prisma.booking.findFirst({
    where: {
      businessId: shopId,
      serviceId,
      scheduledAt,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  })

  if (existingBooking) {
    return NextResponse.json({
      success: false,
      error: "Time slot already booked",
      suggestion: "Please try a different time",
    })
  }

  const staff = await prisma.staff.findFirst({
    where: { businessId: shopId },
  })

  if (!staff) {
    return NextResponse.json({ error: "No staff available at this business" }, { status: 404 })
  }

  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      staffId: staff.id,
      serviceId,
      businessId: shopId,
      scheduledAt,
      duration: service.duration,
      notes: "Booked via phone/automation",
      status: "CONFIRMED",
    },
    include: {
      service: true,
      business: { select: { name: true } },
    },
  })

  return NextResponse.json({
    success: true,
    bookingId: booking.id,
    confirmation: `Booking confirmed! ${service.name} on ${date} at ${time}. Duration: ${service.duration} min. Cost: $${service.price}`,
    details: {
      service: service.name,
      date,
      time,
      duration: service.duration,
      price: service.price,
      business: business.name,
    },
  })
}
