import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendSMS, sendEmail, createNotification } from "@/lib/notify"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // 1-hour reminders
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        scheduledAt: { gte: now, lte: oneHourFromNow },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        service: { select: { name: true } },
        business: { select: { id: true, name: true } },
      },
    })

    // 24-hour reminders (day before)
    const tomorrowBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        scheduledAt: { gte: oneHourFromNow, lte: oneDayFromNow },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        service: { select: { name: true } },
        business: { select: { id: true, name: true } },
      },
    })

    let remindersSent = 0

    // Send 1-hour reminders
    for (const booking of upcomingBookings) {
      const existingReminder = await prisma.notification.findFirst({
        where: {
          userId: booking.customerId,
          type: "BOOKING_REMINDER",
          data: { path: ["bookingId"], equals: booking.id },
        },
      })

      if (existingReminder) continue

      const timeStr = booking.scheduledAt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })

      // In-app notification
      await createNotification({
        userId: booking.customerId,
        type: "BOOKING_REMINDER",
        title: "Appointment in 1 hour",
        message: `Your ${booking.service.name} at ${booking.business.name} is at ${timeStr}. See you soon!`,
        data: { bookingId: booking.id },
      })

      // SMS
      if (booking.customer.phone) {
        await sendSMS(
          booking.customer.phone,
          `⏰ Reminder: Your ${booking.service.name} at ${booking.business.name} is at ${timeStr} (1 hour). See you soon!`,
          booking.business.id
        )
      }

      // Email
      if (booking.customer.email) {
        await sendEmail(
          booking.customer.email,
          `Reminder: ${booking.service.name} at ${booking.business.name}`,
          `<h2>Appointment Reminder</h2>
           <p>Your <strong>${booking.service.name}</strong> at <strong>${booking.business.name}</strong> is at <strong>${timeStr}</strong>.</p>
           <p>See you in 1 hour!</p>
           <p style="color:#666;font-size:12px;">If you need to cancel, please do so at least 2 hours before your appointment.</p>`,
          booking.business.id
        )
      }

      remindersSent++
    }

    // Send 24-hour reminders
    for (const booking of tomorrowBookings) {
      const existingReminder = await prisma.notification.findFirst({
        where: {
          userId: booking.customerId,
          type: "BOOKING_REMINDER",
          data: { path: ["bookingId"], equals: booking.id },
        },
      })

      if (existingReminder) continue

      const dateStr = booking.scheduledAt.toLocaleDateString("en-IN", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
      const timeStr = booking.scheduledAt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })

      await createNotification({
        userId: booking.customerId,
        type: "BOOKING_REMINDER",
        title: "Appointment tomorrow",
        message: `Your ${booking.service.name} at ${booking.business.name} is tomorrow at ${timeStr}.`,
        data: { bookingId: booking.id },
      })

      if (booking.customer.phone) {
        await sendSMS(
          booking.customer.phone,
          `📅 Reminder: Your ${booking.service.name} at ${booking.business.name} is tomorrow (${dateStr}) at ${timeStr}.`,
          booking.business.id
        )
      }

      if (booking.customer.email) {
        await sendEmail(
          booking.customer.email,
          `Tomorrow: ${booking.service.name} at ${booking.business.name}`,
          `<h2>Appointment Tomorrow</h2>
           <p>Your <strong>${booking.service.name}</strong> at <strong>${booking.business.name}</strong> is scheduled for:</p>
           <p><strong>${dateStr} at ${timeStr}</strong></p>
           <p style="color:#666;font-size:12px;">Need to reschedule? Please cancel at least 2 hours before.</p>`,
          booking.business.id
        )
      }

      remindersSent++
    }

    logger.info("Booking reminders sent", { oneHourCount: upcomingBookings.length, tomorrowCount: tomorrowBookings.length, remindersSent })

    return NextResponse.json({
      oneHourReminders: upcomingBookings.length,
      tomorrowReminders: tomorrowBookings.length,
      remindersSent,
    })
  } catch (error) {
    logger.error("Booking reminder cron failed", {}, error as Error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}
