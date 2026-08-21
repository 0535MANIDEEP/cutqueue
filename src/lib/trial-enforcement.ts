"use server"

import { prisma } from "./prisma"
import { TRIAL_DAYS } from "./plans"
import { logger } from "./logger"

/**
 * Checks if a business's trial is currently active.
 * Handles edge cases: null planExpiresAt, database restarts, midnight transitions,
 * and ensures a business always has a valid trial start.
 *
 * @param businessId - The business ID to check
 * @returns true if the trial is active, false otherwise
 */
export async function isTrialActive(businessId: string): Promise<boolean> {
  const business = await prisma.business.findUnique({
    where: { id: businessId } as any,
    select: {
      plan: true,
      planExpiresAt: true,
      createdAt: true,
    },
  })

  if (!business) return false

  // If business has a plan already (upgraded), it's active
  if (business.plan && business.plan !== "FREE") {
    // Plan has expired if planExpiresAt is in the past
    if (business.planExpiresAt) {
      const expires = new Date(business.planExpiresAt)
      return new Date() < expires
    }
    // No expiry set on non-FREE plan - assume active (safety default)
    return true
  }

  // For FREE plan: calculate trial expiry from createdAt
  const now = new Date()
  const createdAt = new Date(business.createdAt)

  // If planExpiresAt is already set, use it (handles DB restart / recovery)
  if (business.planExpiresAt) {
    const expires = new Date(business.planExpiresAt)
    return now < expires
  }

  // Default: 90-day trial from creation date
  // Use start of day for createdAt to avoid timezone oddities at exact midnight
  const trialStart = new Date(createdAt)
  trialStart.setHours(0, 0, 0, 0)

  const trialEnd = new Date(trialStart)
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS) // 90 days

  // Cache the expiry date back to the business for future calls
  // This survives database restarts and midnight transitions
  try {
    await prisma.business.update({
      where: { id: businessId },
      data: { planExpiresAt: trialEnd },
    })
  } catch (err) {
    // Non-blocking: if we can't write, just use calculation
    logger.warn("Failed to cache trial expiry", { businessId, error: err })
  }

  return now < trialEnd
}

/**
 * Gets the full business plan status including days remaining.
 * Returns structured data for UI display.
 *
 * @param businessId - The business ID to check
 * @returns Plan status object with days remaining and expiry info
 */
export async function getBusinessPlanStatus(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId } as any,
    select: {
      plan: true,
      planExpiresAt: true,
      createdAt: true,
    },
  })

  if (!business) return null

  const now = new Date()
  let expiresAt = business.planExpiresAt
  const plan = business.plan || "FREE"

  // Calculate expiry if not set
  if (plan === "FREE" && !expiresAt) {
    // Use start of day for creation to avoid timezone issues
    const createdAtStartOfDay = new Date(business.createdAt)
    createdAtStartOfDay.setHours(0, 0, 0, 0)

    expiresAt = new Date(createdAtStartOfDay)
    expiresAt.setDate(expiresAt.getDate() + TRIAL_DAYS) // 90 days

    // Cache the expiry date
    try {
      await prisma.business.update({
        where: { id: businessId } as any,
        data: { planExpiresAt: expiresAt },
      })
    } catch {
      // Non-blocking
    }
  }

  // Determine if active
  const isActive = expiresAt ? now < expiresAt : plan !== "FREE"

  // Calculate days remaining (always positive, or -1 for unlimited/paid)
  let daysRemaining = -1
  if (expiresAt) {
    const diffMs = expiresAt.getTime() - now.getTime()
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  }

  // Inline plan limits - avoid TypeScript dynamic indexing issues
  let limits: any
  if (plan === "FREE") {
    limits = {
      maxBookingsPerMonth: 100,
      maxServices: 10,
      maxStaff: 2,
      maxQueueEntries: 50,
    }
  } else if (plan === "PRO") {
    limits = {
      maxBookingsPerMonth: 2000,
      maxServices: 100,
      maxStaff: 15,
      maxQueueEntries: 500,
    }
  } else {
    limits = {
      maxBookingsPerMonth: 10000,
      maxServices: 500,
      maxStaff: 50,
      maxQueueEntries: 5000,
    }
  }

  return {
    plan: business.plan,
    expiresAt,
    isActive,
    daysRemaining,
    limits,
  }
}

/**
 * Gets trial warnings for display in the UI.
 * Shows appropriate messages based on how much time is left.
 *
 * @param expiresAt - The trial expiry date
 * @returns Array of warning messages
 */
export function getTrialWarnings(expiresAt: Date): string[] {
  const warnings: string[] = []
  const now = new Date()
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysRemaining <= 0) {
    warnings.push("Your trial has expired. Upgrade to keep your business online.")
  } else if (daysRemaining <= 7) {
    warnings.push(`Trial expires in ${daysRemaining} days. Upgrade to keep your business online.`)
  } else if (daysRemaining <= 14) {
    warnings.push(`Trial expires in ${daysRemaining} days. Choose a plan to continue.`)
  } else if (daysRemaining <= 30) {
    warnings.push(`Trial expires in ${daysRemaining} days. Explore our pricing plans.`)
  } else if (daysRemaining <= 60) {
    warnings.push(`Trial expires in ${daysRemaining} days. A plan will soon be required.`)
  } else {
    warnings.push(`Trial valid for ${daysRemaining} more days. Secure your preferred plan.`)
  }

  return warnings
}

/**
 * Force recalculation of trial expiry for a business.
 * Useful if the cached expiry seems wrong or after manual plan changes.
 */
export async function recalculateTrialExpiry(businessId: string): Promise<boolean> {
  const business = await prisma.business.findUnique({
    where: { id: businessId } as any,
    select: {
      plan: true,
      createdAt: true,
    },
  })

  if (!business) return false

  const now = new Date()
  const createdAt = new Date(business.createdAt)
  const plan = business.plan || "FREE"

  if (plan === "FREE") {
    const trialEnd = new Date(createdAt)
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS)

    try {
      await prisma.business.update({
        where: { id: businessId } as any,
        data: { planExpiresAt: trialEnd },
      })
      return true
    } catch {
      return false
    }
  }

  // For non-FREE plans, clear the expiry (or you could set a renewal date)
  try {
    await prisma.business.update({
      where: { id: businessId } as any,
      data: { planExpiresAt: null },
    })
    return true
  } catch {
    return false
  }
}

// ----- Legacy: Queue limit enforcement functions (used by API routes) -----

/**
 * Checks booking limits for a business based on their plan.
 */
export async function enforceBookingLimits(businessId: string): Promise<{ allowed: boolean; error?: string }> {
  const plan = await getBusinessPlanStatus(businessId)

  if (!plan) return { allowed: false, error: "Business not found" }

  const config = plan.limits

  const now = new Date()
  const bookingsThisMonth = await prisma.booking.count({
    where: {
      businessId,
      createdAt: {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
      },
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

/**
 * Checks service limits for a business based on their plan.
 */
export async function enforceServiceLimits(businessId: string): Promise<{ allowed: boolean; error?: string }> {
  const plan = await getBusinessPlanStatus(businessId)

  if (!plan) return { allowed: false, error: "Business not found" }

  const config = plan.limits

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

/**
 * Checks queue limits for a business based on their plan.
 */
export async function enforceQueueLimits(businessId: string): Promise<{ allowed: boolean; error?: string }> {
  const plan = await getBusinessPlanStatus(businessId)

  if (!plan) return { allowed: false, error: "Business not found" }

  const config = plan.limits

  const queue = await prisma.queue.findFirst({
    where: { businessId } as any,
  })

  if (queue) {
    const activeEntries = await prisma.queueEntry.count({
      where: {
        queueId: queue.id,
        status: {
          in: ["WAITING", "CALLED", "IN_PROGRESS"],
        } as any,
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