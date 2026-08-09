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

  const shop = await prisma.barberShop.findUnique({ where: { id: shopId } })
  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 })
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
        email: `${customerPhone.replace(/\D/g, "")}@cutqueue.local`,
        role: "CUSTOMER",
      },
    })
  }

  const scheduledAt = new Date(`${date}T${time}:00`)

  const existingBooking = await prisma.booking.findFirst({
    where: {
      shopId,
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

  const barber = await prisma.barberProfile.findFirst({
    where: { shopId },
  })

  if (!barber) {
    return NextResponse.json({ error: "No barber available at this shop" }, { status: 404 })
  }

  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      barberId: barber.id,
      serviceId,
      shopId,
      scheduledAt,
      duration: service.duration,
      notes: "Booked via phone/automation",
      status: "CONFIRMED",
    },
    include: {
      service: true,
      shop: { select: { name: true } },
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
      shop: shop.name,
    },
  })
}
