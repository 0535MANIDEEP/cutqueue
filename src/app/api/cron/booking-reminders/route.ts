import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        scheduledAt: {
          gte: now,
          lte: oneHourFromNow,
        },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        service: { select: { name: true } },
        business: { select: { name: true } },
      },
    })

    let remindersSent = 0

    for (const booking of upcomingBookings) {
      const existingReminder = await prisma.notification.findFirst({
        where: {
          userId: booking.customerId,
          type: "BOOKING_REMINDER",
          data: { path: ["bookingId"], equals: booking.id },
        },
      })

      if (existingReminder) continue

      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          type: "BOOKING_REMINDER",
          title: "Appointment Reminder",
          message: `Your ${booking.service.name} at ${booking.business.name} is in 1 hour.`,
          data: { bookingId: booking.id },
        },
      })

      remindersSent++
    }

    logger.info("Booking reminders sent", { count: remindersSent })

    return NextResponse.json({
      checked: upcomingBookings.length,
      remindersSent,
    })
  } catch (error) {
    logger.error("Booking reminder cron failed", {}, error as Error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}
