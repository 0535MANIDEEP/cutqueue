import { prisma } from "./prisma"

export interface TrialConfig {
  trialDays: number
  maxSmsPerDay: number
  maxEmailsPerDay: number
  maxBookingsPerMonth: number
  maxStaff: number
  maxServices: number
  maxQueueEntries: number
  features: {
    analytics: boolean
    notifications: boolean
    prioritySupport: boolean
    customBranding: boolean
    apiAccess: boolean
    multiLocation: boolean
  }
}

export interface TrialStatus {
  isActive: boolean
  daysRemaining: number
  daysUsed: number
  expiresAt: Date | null
  usage: {
    smsSent: number
    emailsSent: number
    bookingsThisMonth: number
    staffCount: number
    servicesCount: number
  }
  warnings: string[]
}

const TRIAL_DAYS = 90

export const PLAN_LIMITS: Record<string, TrialConfig> = {
  FREE: {
    trialDays: TRIAL_DAYS,
    maxSmsPerDay: 0,
    maxEmailsPerDay: 0,
    maxBookingsPerMonth: 100,
    maxStaff: 2,
    maxServices: 10,
    maxQueueEntries: 50,
    features: {
      analytics: false,
      notifications: true,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      multiLocation: false,
    },
  },
  STARTER: {
    trialDays: 0,
    maxSmsPerDay: 10,
    maxEmailsPerDay: 25,
    maxBookingsPerMonth: 500,
    maxStaff: 5,
    maxServices: 25,
    maxQueueEntries: 200,
    features: {
      analytics: true,
      notifications: true,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      multiLocation: false,
    },
  },
  PRO: {
    trialDays: 0,
    maxSmsPerDay: 50,
    maxEmailsPerDay: 100,
    maxBookingsPerMonth: 2000,
    maxStaff: 15,
    maxServices: 100,
    maxQueueEntries: 500,
    features: {
      analytics: true,
      notifications: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: false,
      multiLocation: false,
    },
  },
  BUSINESS: {
    trialDays: 0,
    maxSmsPerDay: 200,
    maxEmailsPerDay: 500,
    maxBookingsPerMonth: 10000,
    maxStaff: 50,
    maxServices: 500,
    maxQueueEntries: 5000,
    features: {
      analytics: true,
      notifications: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      multiLocation: true,
    },
  },
}

export const PRICING_TIERS = {
  FREE: {
    name: "Free Trial",
    price: 0,
    priceLabel: "Free",
    period: "90 days",
    smsPerDay: 0,
    emailsPerDay: 0,
    bookingsPerMonth: 100,
    staff: 2,
    services: 10,
    features: ["Basic queue management", "Basic booking", "In-app notifications", "1 staff member"],
    description: "Try QueueForge free for 90 days",
    cta: "Start Free Trial",
  },
  STARTER: {
    name: "Starter",
    price: 499,
    priceLabel: "\u20B9499",
    period: "/month",
    smsPerDay: 10,
    emailsPerDay: 25,
    bookingsPerMonth: 500,
    staff: 5,
    services: 25,
    features: [
      "Queue + Booking management",
      "SMS & email notifications",
      "Basic analytics dashboard",
      "Up to 5 staff members",
      "Customer reviews",
      "WhatsApp sharing",
    ],
    description: "For growing barbershops & salons",
    cta: "Get Started",
  },
  PRO: {
    name: "Pro",
    price: 999,
    priceLabel: "\u20B9999",
    period: "/month",
    smsPerDay: 50,
    emailsPerDay: 100,
    bookingsPerMonth: 2000,
    staff: 15,
    services: 100,
    features: [
      "Everything in Starter",
      "AI-powered insights",
      "Portfolio gallery",
      "Priority support",
      "Custom branding",
      "Up to 15 staff members",
      "Advanced analytics",
    ],
    description: "For established businesses",
    cta: "Upgrade to Pro",
  },
  BUSINESS: {
    name: "Business",
    price: 1999,
    priceLabel: "\u20B91,999",
    period: "/month",
    smsPerDay: 200,
    emailsPerDay: 500,
    bookingsPerMonth: 10000,
    staff: 50,
    services: 500,
    features: [
      "Everything in Pro",
      "Multi-location support",
      "API access",
      "White-label options",
      "Dedicated support",
      "Up to 50 staff members",
      "Custom integrations",
    ],
    description: "For chains and franchises",
    cta: "Contact Sales",
  },
}

export function getTrialConfig(plan: string): TrialConfig {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE
}

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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}
