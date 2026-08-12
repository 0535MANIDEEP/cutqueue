import { prisma } from "./prisma"
import { Prisma } from "../generated/prisma/client"
import { getBusinessCredentials, hasTwilioCredentials, hasResendCredentials } from "./business-credentials"
import { twilioBreaker, resendBreaker } from "./circuit-breaker"
import { logger } from "./logger"

const PLATFORM_RESEND_API_KEY = process.env.RESEND_API_KEY

interface NotifyParams {
  userId: string
  type: "BOOKING_CONFIRMED" | "BOOKING_REMINDER" | "BOOKING_CANCELLED" | "QUEUE_UPDATE" | "QUEUE_YOUR_TURN" | "REWARD_EARNED" | "COMPLAINT_UPDATE" | "ANNOUNCEMENT" | "SYSTEM"
  title: string
  message: string
  data?: Record<string, string>
}

export async function createNotification(params: NotifyParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: (params.data || {}) as unknown as Prisma.InputJsonValue,
      },
    })
  } catch (error) {
    logger.error("Failed to create notification", { userId: params.userId }, error as Error)
  }
}

async function sendSMSRaw(to: string, message: string, creds: { accountSid: string; authToken: string; phoneNumber: string }): Promise<boolean> {
  const { accountSid, authToken, phoneNumber } = creds
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

  const body = new URLSearchParams()
  body.append("To", to)
  body.append("From", phoneNumber)
  body.append("Body", message)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  })

  return response.ok
}

export async function sendSMS(to: string, message: string, businessId: string): Promise<boolean> {
  const creds = await getBusinessCredentials(businessId)

  if (!hasTwilioCredentials(creds) || !creds.twilio) {
    return false
  }

  try {
    return await twilioBreaker.call(() => sendSMSRaw(to, message, creds.twilio!))
  } catch (error) {
    logger.error("Failed to send SMS (circuit breaker open)", { businessId, to }, error as Error)
    return false
  }
}

async function sendEmailRaw(to: string, subject: string, html: string, apiKey: string): Promise<boolean> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "QueueForge <notifications@queueforge.app>",
      to: [to],
      subject,
      html,
    }),
  })

  return response.ok
}

export async function sendEmail(to: string, subject: string, html: string, businessId: string): Promise<boolean> {
  const creds = await getBusinessCredentials(businessId)

  if (!hasResendCredentials(creds) || !creds.resend) {
    return false
  }

  try {
    return await resendBreaker.call(() => sendEmailRaw(to, subject, html, creds.resend!.apiKey))
  } catch (error) {
    logger.error("Failed to send email (circuit breaker open)", { businessId, to }, error as Error)
    return false
  }
}

export async function notifyBookingCreated(booking: {
  id: string
  customerId: string
  businessId: string
  scheduledAt: Date
  service: { name: string }
  business: { name: string }
}): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: booking.businessId },
    select: { ownerId: true, name: true },
  })

  if (business) {
    await createNotification({
      userId: business.ownerId,
      type: "BOOKING_CONFIRMED",
      title: "New Booking",
      message: `New booking for ${booking.service.name} on ${booking.scheduledAt.toLocaleDateString()} at ${booking.scheduledAt.toLocaleTimeString()}`,
      data: { bookingId: booking.id, customerId: booking.customerId },
    })
  }

  await createNotification({
    userId: booking.customerId,
    type: "BOOKING_CONFIRMED",
    title: "Booking Confirmed",
    message: `Your ${booking.service.name} at ${booking.business.name} is confirmed for ${booking.scheduledAt.toLocaleDateString()} at ${booking.scheduledAt.toLocaleTimeString()}`,
    data: { bookingId: booking.id },
  })

  const customer = await prisma.user.findUnique({
    where: { id: booking.customerId },
    select: { phone: true, email: true },
  })

  if (customer?.phone) {
    await sendSMS(
      customer.phone,
      `Booking confirmed! ${booking.service.name} at ${booking.business.name} on ${booking.scheduledAt.toLocaleDateString()} at ${booking.scheduledAt.toLocaleTimeString()}`,
      booking.businessId
    )
  }

  if (customer?.email) {
    await sendEmail(
      customer.email,
      `Booking Confirmed - ${booking.business.name}`,
      `<h2>Booking Confirmed</h2><p>Your ${booking.service.name} at ${booking.business.name} is confirmed for ${booking.scheduledAt.toLocaleDateString()} at ${booking.scheduledAt.toLocaleTimeString()}.</p>`,
      booking.businessId
    )
  }
}

export async function notifyBookingCancelled(booking: {
  id: string
  customerId: string
  businessId: string
  scheduledAt: Date
  service: { name: string }
  business: { name: string }
}): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: booking.businessId },
    select: { ownerId: true },
  })

  if (business) {
    await createNotification({
      userId: business.ownerId,
      type: "BOOKING_CANCELLED",
      title: "Booking Cancelled",
      message: `Booking for ${booking.service.name} on ${booking.scheduledAt.toLocaleDateString()} has been cancelled`,
      data: { bookingId: booking.id },
    })
  }

  await createNotification({
    userId: booking.customerId,
    type: "BOOKING_CANCELLED",
    title: "Booking Cancelled",
    message: `Your ${booking.service.name} at ${booking.business.name} on ${booking.scheduledAt.toLocaleDateString()} has been cancelled`,
    data: { bookingId: booking.id },
  })

  const customer = await prisma.user.findUnique({
    where: { id: booking.customerId },
    select: { phone: true },
  })

  if (customer?.phone) {
    await sendSMS(
      customer.phone,
      `Booking cancelled: ${booking.service.name} at ${booking.business.name} on ${booking.scheduledAt.toLocaleDateString()}`,
      booking.businessId
    )
  }
}

export async function notifyBookingCompleted(booking: {
  id: string
  customerId: string
  businessId: string
  service: { name: string }
  business: { name: string }
}): Promise<void> {
  await createNotification({
    userId: booking.customerId,
    type: "SYSTEM",
    title: "Service Completed",
    message: `Your ${booking.service.name} at ${booking.business.name} is complete. Leave a review!`,
    data: { bookingId: booking.id },
  })

  const customer = await prisma.user.findUnique({
    where: { id: booking.customerId },
    select: { phone: true, email: true },
  })

  if (customer?.phone) {
    await sendSMS(
      customer.phone,
      `Thanks for visiting ${booking.business.name}! Your ${booking.service.name} is complete. Leave us a review!`,
      booking.businessId
    )
  }

  if (customer?.email) {
    await sendEmail(
      customer.email,
      `Thanks for visiting ${booking.business.name}!`,
      `<h2>Service Complete</h2><p>Your ${booking.service.name} at ${booking.business.name} is complete.</p><p>We'd love your feedback!</p>`,
      booking.businessId
    )
  }
}

export async function notifyQueueJoined(entry: {
  id: string
  userId: string
  ticketNumber: number
  position: number
  estimatedWait: number
}): Promise<void> {
  await createNotification({
    userId: entry.userId,
    type: "QUEUE_UPDATE",
    title: "Added to Queue",
    message: `You're in queue! Ticket #${entry.ticketNumber}. Position: ${entry.position}. Estimated wait: ${entry.estimatedWait} min`,
    data: { entryId: entry.id },
  })
}

export async function notifyQueueCalled(entry: {
  id: string
  userId: string
  ticketNumber: number
}): Promise<void> {
  await createNotification({
    userId: entry.userId,
    type: "QUEUE_YOUR_TURN",
    title: "Your Turn!",
    message: `Ticket #${entry.ticketNumber} — please come to the counter now!`,
    data: { entryId: entry.id },
  })

  const user = await prisma.user.findUnique({
    where: { id: entry.userId },
    select: { phone: true },
  })

  const queueEntry = await prisma.queueEntry.findUnique({
    where: { id: entry.id },
    select: { queue: { select: { businessId: true } } },
  })

  if (user?.phone && queueEntry) {
    await sendSMS(
      user.phone,
      `Ticket #${entry.ticketNumber} — please come to the counter now!`,
      queueEntry.queue.businessId
    )
  }
}

export async function notifyComplaintCreated(complaint: {
  id: string
  customerId: string
  businessId: string
  subject: string
}): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: complaint.businessId },
    select: { ownerId: true },
  })

  if (business) {
    await createNotification({
      userId: business.ownerId,
      type: "COMPLAINT_UPDATE",
      title: "New Complaint Filed",
      message: `A customer filed a complaint: "${complaint.subject}"`,
      data: { complaintId: complaint.id },
    })
  }
}

export async function notifyComplaintResponded(complaint: {
  id: string
  customerId: string
  subject: string
  response: string
}): Promise<void> {
  await createNotification({
    userId: complaint.customerId,
    type: "COMPLAINT_UPDATE",
    title: "Complaint Response",
    message: `Your complaint "${complaint.subject}" has been responded to: ${complaint.response}`,
    data: { complaintId: complaint.id },
  })
}

export async function notifyAnnouncement(businessId: string, title: string, content: string): Promise<void> {
  const customers = await prisma.booking.findMany({
    where: { businessId },
    select: { customerId: true },
    distinct: ["customerId"],
  })

  const owner = await prisma.business.findUnique({
    where: { id: businessId },
    select: { ownerId: true },
  })

  const userIds = new Set<string>()
  if (owner) userIds.add(owner.ownerId)
  customers.forEach((c) => userIds.add(c.customerId))

  await Promise.all(
    Array.from(userIds).map((userId) =>
      createNotification({
        userId,
        type: "ANNOUNCEMENT",
        title,
        message: content,
        data: { businessId },
      })
    )
  )
}

export async function sendPlatformEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!PLATFORM_RESEND_API_KEY) {
    logger.warn("Platform Resend API key not configured, skipping email", { to })
    return false
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PLATFORM_RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "QueueForge <notifications@queueforge.app>",
        to: [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error("Platform email send failed", { to, error })
      return false
    }

    return true
  } catch (error) {
    logger.error("Platform email send error", { to }, error as Error)
    return false
  }
}

export async function triggerN8NWebhook(event: string, data: Record<string, string>): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) return

  try {
    await fetch(`${webhookUrl}/webhook/${event}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  } catch (error) {
    console.error(`Failed to trigger n8n webhook ${event}:`, error)
  }
}
