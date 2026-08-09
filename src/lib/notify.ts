import { prisma } from "./prisma"
import { Prisma } from "../generated/prisma/client"

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
    console.error("Failed to create notification:", error)
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

export async function triggerN8NWebhook(event: string, data: Record<string, unknown>): Promise<void> {
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
