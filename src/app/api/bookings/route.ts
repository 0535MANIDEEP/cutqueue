import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notifyBookingCreated, notifyBookingCancelled, notifyBookingCompleted, triggerN8NWebhook } from "@/lib/notify"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const businessId = url.searchParams.get("businessId")

    let bookings: Awaited<ReturnType<typeof prisma.booking.findMany>> = []

    if (session.user.role === "ADMIN") {
      bookings = await prisma.booking.findMany({
        where: businessId ? { businessId } : {},
        include: {
          customer: { select: { name: true, email: true } },
          staff: { include: { user: { select: { name: true } } } },
          service: true,
          business: { select: { name: true, address: true } },
        },
        orderBy: { scheduledAt: "desc" },
        take: 50,
      })
    } else if (session.user.role === "BUSINESS_OWNER") {
      const business = await prisma.business.findFirst({
        where: { ownerId: session.user.id },
      })
      if (business) {
        bookings = await prisma.booking.findMany({
          where: { businessId: business.id },
          include: {
            customer: { select: { name: true, email: true } },
            staff: { include: { user: { select: { name: true } } } },
            service: true,
          },
          orderBy: { scheduledAt: "desc" },
          take: 50,
        })
      } else {
        bookings = []
      }
    } else if (session.user.role === "STAFF") {
      const staff = await prisma.staff.findFirst({
        where: { userId: session.user.id },
      })
      if (staff) {
        bookings = await prisma.booking.findMany({
          where: { staffId: staff.id },
          include: {
            customer: { select: { name: true, email: true } },
            service: true,
            business: { select: { name: true } },
          },
          orderBy: { scheduledAt: "desc" },
          take: 50,
        })
      } else {
        bookings = []
      }
    } else {
      bookings = await prisma.booking.findMany({
        where: { customerId: session.user.id },
        include: {
          staff: { include: { user: { select: { name: true, image: true } } } },
          service: true,
          business: { select: { name: true, address: true } },
        },
        orderBy: { scheduledAt: "desc" },
        take: 20,
      })
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Bookings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { staffId, serviceId, businessId, scheduledAt, notes } = await req.json()

    if (!staffId || !serviceId || !businessId || !scheduledAt) {
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
        staffId,
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
        customerId: session.user.id,
        staffId,
        serviceId,
        businessId,
        scheduledAt: new Date(scheduledAt),
        duration: service.duration,
        notes,
        status: "PENDING",
      },
      include: {
        service: { select: { name: true } },
        business: { select: { name: true } },
      },
    })

    await notifyBookingCreated(booking)
    await triggerN8NWebhook("booking.created", { bookingId: booking.id, businessId })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Bookings POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookingId, status, scheduledAt } = await req.json()

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "Missing bookingId or status" },
        { status: 400 }
      )
    }

    const validStatuses = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: { select: { name: true } },
        business: { select: { name: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const isAdmin = session.user.role === "ADMIN"
    const isCustomer = session.user.id === booking.customerId

    let isOwner = false
    if (session.user.role === "BUSINESS_OWNER") {
      const business = await prisma.business.findFirst({
        where: { ownerId: session.user.id },
      })
      isOwner = business?.id === booking.businessId
    }

    let isStaff = false
    if (session.user.role === "STAFF") {
      const staff = await prisma.staff.findFirst({
        where: { userId: session.user.id },
      })
      isStaff = staff?.id === booking.staffId
    }

    if (!isAdmin && !isOwner && !isStaff && !isCustomer) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (isCustomer && status !== "CANCELLED") {
      return NextResponse.json({ error: "Customers can only cancel bookings" }, { status: 403 })
    }

    const updateData: Record<string, unknown> = { status }

    if (scheduledAt) {
      updateData.scheduledAt = new Date(scheduledAt)
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    })

    if (status === "CANCELLED") {
      await notifyBookingCancelled(booking)
      await triggerN8NWebhook("booking.cancelled", { bookingId, businessId: booking.businessId })
    } else if (status === "COMPLETED") {
      await notifyBookingCompleted(booking)
      await triggerN8NWebhook("booking.completed", { bookingId, businessId: booking.businessId })
    } else if (status === "CONFIRMED") {
      await triggerN8NWebhook("booking.confirmed", { bookingId, businessId: booking.businessId })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Bookings PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { bookingId } = await req.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })
    }

    const existing = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    await prisma.booking.delete({ where: { id: bookingId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Bookings DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
