import { prisma } from "./prisma"
import { PLAN_LIMITS, TRIAL_DAYS, type PlanLimits } from "./plans"

export type { PlanLimits }
export { PLAN_LIMITS, TRIAL_DAYS }

export async function isTrialActive(businessId: string): Promise<boolean> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { plan: true, planExpiresAt: true, createdAt: true },
  })

  if (!business) return false

  if (business.plan === "FREE") {
    if (!business.planExpiresAt) {
      const expiry = new Date(business.createdAt)
      expiry.setDate(expiry.getDate() + TRIAL_DAYS)
      return new Date() < expiry
    }
    return new Date() < business.planExpiresAt
  }

  if (business.planExpiresAt) {
    return new Date() < business.planExpiresAt
  }

  return true
}

export function getTrialConfig(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE
}

export async function getBusinessPlanStatus(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { plan: true, planExpiresAt: true, createdAt: true },
  })

  if (!business) return null

  let expiresAt = business.planExpiresAt
  if (business.plan === "FREE" && !expiresAt) {
    expiresAt = new Date(business.createdAt)
    expiresAt.setDate(expiresAt.getDate() + TRIAL_DAYS)
  }

  const now = new Date()
  const isActive = expiresAt ? now < expiresAt : business.plan !== "FREE"
  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : -1

  return {
    plan: business.plan,
    expiresAt,
    isActive,
    daysRemaining,
    limits: getTrialConfig(business.plan),
  }
}

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
  }

  return warnings
}
