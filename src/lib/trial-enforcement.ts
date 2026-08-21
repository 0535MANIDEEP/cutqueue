"use server"

import { prisma } from "./prisma"
import { getTrialConfig } from "./trial"

async function getBusinessPlan(businessId: string): Promise<string> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { plan: true },
  })
  return business?.plan || "FREE"
}

export async function enforceBookingLimits(businessId: string): Promise<{ allowed: boolean; error?: string }> {
  const plan = await getBusinessPlan(businessId)
  const config = getTrialConfig(plan)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const bookingsThisMonth = await prisma.booking.count({
    where: {
      businessId,
      createdAt: { gte: startOfMonth },
    },
  })

  if (bookingsThisMonth >= config.maxBookingsPerMonth) {
    return {
      allowed: false,
      error: `Monthly booking limit reached (${config.maxBookingsPerMonth}). Upgrade your plan to continue accepting bookings.`,
    }
  }

  return { allowed: true }
}

export async function enforceServiceLimits(businessId: string): Promise<{ allowed: boolean; error?: string }> {
  const plan = await getBusinessPlan(businessId)
  const config = getTrialConfig(plan)
  const servicesCount = await prisma.service.count({
    where: { businessId },
  })

  if (servicesCount >= config.maxServices) {
    return {
      allowed: false,
      error: `Service limit reached (${config.maxServices}). Upgrade your plan to add more services.`,
    }
  }

  return { allowed: true }
}

export async function enforceStaffLimits(businessId: string): Promise<{ allowed: boolean; error?: string }> {
  const plan = await getBusinessPlan(businessId)
  const config = getTrialConfig(plan)
  const staffCount = await prisma.staff.count({
    where: { businessId },
  })

  if (staffCount >= config.maxStaff) {
    return {
      allowed: false,
      error: `Staff limit reached (${config.maxStaff}). Upgrade your plan to add more staff.`,
    }
  }

  return { allowed: true }
}

export async function enforceQueueLimits(businessId: string): Promise<{ allowed: boolean; error?: string }> {
  const plan = await getBusinessPlan(businessId)
  const config = getTrialConfig(plan)
  const queue = await prisma.queue.findFirst({
    where: { businessId },
  })

  if (queue) {
    const activeEntries = await prisma.queueEntry.count({
      where: {
        queueId: queue.id,
        status: { in: ["WAITING", "CALLED", "IN_PROGRESS"] },
      },
    })

    if (activeEntries >= config.maxQueueEntries) {
      return {
        allowed: false,
        error: `Queue capacity reached (${config.maxQueueEntries}). Customers cannot join until spots open up.`,
      }
    }
  }

  return { allowed: true }
}
