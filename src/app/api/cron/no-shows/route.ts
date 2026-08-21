import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notify"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    // Find CONFIRMED bookings that started > 2 hours ago and weren't completed/cancelled
    const missedBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        scheduledAt: { lt: twoHoursAgo },
      },
      include: {
        customer: { select: { id: true, name: true } },
        business: { select: { id: true, ownerId: true, name: true } },
        service: { select: { name: true } },
      },
    })

    let noShowsDetected = 0

    for (const booking of missedBookings) {
      // Mark as no-show
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "NO_SHOW" },
      })

      // Create no-show record
      await prisma.noShow.create({
        data: {
          customerId: booking.customerId,
          businessId: booking.businessId,
          bookingId: booking.id,
          reason: "Auto-detected: booking not completed within 2 hours",
        },
      })

      // Notify customer
      await createNotification({
        userId: booking.customerId,
        type: "SYSTEM",
        title: "Missed Appointment",
        message: `We missed you at ${booking.business.name} for your ${booking.service.name} appointment. Please book again soon.`,
        data: { bookingId: booking.id },
      })

      // Notify owner
      await createNotification({
        userId: booking.business.ownerId,
        type: "SYSTEM",
        title: "No-Show Detected",
        message: `${booking.customer.name} did not show up for ${booking.service.name} at ${booking.scheduledAt.toLocaleTimeString("en-IN")}.`,
        data: { bookingId: booking.id, customerId: booking.customerId },
      })

      // Check if customer has too many no-shows
      const customerNoShows = await prisma.noShow.count({
        where: {
          customerId: booking.customerId,
          businessId: booking.businessId,
        },
      })

      // Get cancellation policy
      const policy = await prisma.cancellationPolicy.findFirst({
        where: { businessId: booking.businessId },
      })

      const maxNoShows = policy?.maxNoShowsBeforeBlock || 3
      if (customerNoShows >= maxNoShows) {
        await createNotification({
          userId: booking.business.ownerId,
          type: "SYSTEM",
          title: "Customer Blocked",
          message: `${booking.customer.name} has ${customerNoShows} no-shows and should be blocked from future bookings.`,
          data: { customerId: booking.customerId },
        })
      }

      noShowsDetected++
    }

    logger.info("No-show detection completed", { detected: noShowsDetected })

    return NextResponse.json({
      checked: missedBookings.length,
      noShowsDetected,
    })
  } catch (error) {
    logger.error("No-show cron failed", {}, error as Error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}
