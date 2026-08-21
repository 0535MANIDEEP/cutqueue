import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createNotification, sendSMS, sendEmail } from "@/lib/notify"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Find COMPLETED bookings from 4-24 hours ago
    const completedBookings = await prisma.booking.findMany({
      where: {
        status: "COMPLETED",
        updatedAt: { gte: twentyFourHoursAgo, lte: fourHoursAgo },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        service: { select: { name: true } },
        business: { select: { id: true, name: true } },
      },
    })

    let reviewRequestsSent = 0

    for (const booking of completedBookings) {
      // Check if already reviewed this business
      const existingReview = await prisma.review.findFirst({
        where: {
          customerId: booking.customerId,
          businessId: booking.businessId,
        },
      })
      if (existingReview) continue

      // Check if review request already sent
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: booking.customerId,
          type: "SYSTEM",
          title: "How was your experience?",
        },
      })
      if (existingNotification) continue

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cutqueue-amber.vercel.app"
      const reviewUrl = `${appUrl}/review?business=${booking.businessId}`

      // In-app notification
      await createNotification({
        userId: booking.customerId,
        type: "SYSTEM",
        title: "How was your experience?",
        message: `How was your ${booking.service.name} at ${booking.business.name}? Leave a quick review!`,
      })

      // SMS
      if (booking.customer.phone) {
        await sendSMS(
          booking.customer.phone,
          `⭐ How was your ${booking.service.name} at ${booking.business.name}? Rate us: ${reviewUrl}`,
          booking.business.id
        )
      }

      // Email
      if (booking.customer.email) {
        await sendEmail(
          booking.customer.email,
          `How was your experience at ${booking.business.name}?`,
          `<h2>We'd love your feedback!</h2>
           <p>Hi ${booking.customer.name},</p>
           <p>How was your <strong>${booking.service.name}</strong> at <strong>${booking.business.name}</strong>?</p>
           <p>Your review helps other customers and helps us improve.</p>
           <p><a href="${reviewUrl}" style="display:inline-block;padding:12px 24px;background:#E8B547;color:#0F1B17;text-decoration:none;border-radius:8px;font-weight:bold;">Leave a Review</a></p>
           <p style="color:#999;font-size:12px;margin-top:24px;">This is a one-time request. We won't ask again.</p>`,
          booking.business.id
        )
      }

      reviewRequestsSent++
    }

    logger.info("Review requests sent", { count: reviewRequestsSent })

    return NextResponse.json({
      checked: completedBookings.length,
      reviewRequestsSent,
    })
  } catch (error) {
    logger.error("Review request cron failed", {}, error as Error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}
