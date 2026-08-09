export interface TrialConfig {
  isActive: boolean
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

const TRIAL_CONFIG: TrialConfig = {
  isActive: true,
  trialDays: 90, // 3 months free (JIO gave 6 months)
  maxSmsPerDay: 0, // ZERO SMS costs during trial
  maxEmailsPerDay: 0, // ZERO email costs during trial
  maxBookingsPerMonth: 1000, // Generous limit
  maxStaff: 10,
  maxServices: 50,
  maxQueueEntries: 100,
  features: {
    analytics: true,
    notifications: true, // In-app only, no SMS/email
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    multiLocation: false,
  },
}

// Post-trial pricing (JIO-style tiers)
export const PRICING_TIERS = {
  FREE: {
    name: "Free",
    price: 0,
    smsPerDay: 0,
    emailsPerDay: 0,
    bookingsPerMonth: 100,
    staff: 2,
    services: 10,
    features: ["Basic queue", "Basic booking", "In-app notifications"],
    description: "For small shops just getting started",
  },
  STARTER: {
    name: "Starter",
    price: 15,
    smsPerDay: 10,
    emailsPerDay: 25,
    bookingsPerMonth: 500,
    staff: 5,
    services: 25,
    features: ["Queue + Booking", "SMS notifications", "Basic analytics", "Customer reviews"],
    description: "For growing businesses",
  },
  PRO: {
    name: "Pro",
    price: 30,
    smsPerDay: 50,
    emailsPerDay: 100,
    bookingsPerMonth: 2000,
    staff: 15,
    services: 100,
    features: ["Everything in Starter", "AI automation", "Portfolio gallery", "Priority support", "Custom branding"],
    description: "For established businesses",
  },
  BUSINESS: {
    name: "Business",
    price: 75,
    smsPerDay: 200,
    emailsPerDay: 500,
    bookingsPerMonth: 10000,
    staff: 50,
    services: 500,
    features: ["Everything in Pro", "Multi-location", "API access", "White-label", "Dedicated support"],
    description: "For chains and franchises",
  },
}

// JIO-style revenue projection
export const REVENUE_PROJECTION = {
  month1: { businesses: 50, revenue: 0, cost: 0 },
  month2: { businesses: 150, revenue: 0, cost: 0 },
  month3: { businesses: 400, revenue: 0, cost: 0 },
  month4: { businesses: 600, revenue: 2250, cost: 50 }, // 25% convert to paid ($15 avg)
  month5: { businesses: 900, revenue: 4500, cost: 75 },
  month6: { businesses: 1200, revenue: 9000, cost: 100 },
  month12: { businesses: 3000, revenue: 36000, cost: 200 },
}

export function getTrialConfig(): TrialConfig {
  return { ...TRIAL_CONFIG }
}

export function isTrialActive(): boolean {
  return TRIAL_CONFIG.isActive
}

export function getTrialDays(): number {
  return TRIAL_CONFIG.trialDays
}

export function checkTrialLimits(usage: {
  smsToday?: number
  emailsToday?: number
  bookingsThisMonth?: number
  staffCount?: number
  servicesCount?: number
}): { allowed: boolean; reason?: string } {
  if (!TRIAL_CONFIG.isActive) {
    return { allowed: true }
  }

  if (usage.smsToday && usage.smsToday >= TRIAL_CONFIG.maxSmsPerDay) {
    return {
      allowed: false,
      reason: `SMS limit reached (${TRIAL_CONFIG.maxSmsPerDay}/day). Upgrade to Starter plan for SMS notifications.`,
    }
  }

  if (usage.emailsToday && usage.emailsToday >= TRIAL_CONFIG.maxEmailsPerDay) {
    return {
      allowed: false,
      reason: `Email limit reached (${TRIAL_CONFIG.maxEmailsPerDay}/day). Upgrade to Starter plan for email notifications.`,
    }
  }

  if (usage.bookingsThisMonth && usage.bookingsThisMonth >= TRIAL_CONFIG.maxBookingsPerMonth) {
    return {
      allowed: false,
      reason: `Booking limit reached (${TRIAL_CONFIG.maxBookingsPerMonth}/month). Upgrade to Starter plan.`,
    }
  }

  if (usage.staffCount && usage.staffCount >= TRIAL_CONFIG.maxStaff) {
    return {
      allowed: false,
      reason: `Staff limit reached (${TRIAL_CONFIG.maxStaff}). Upgrade to Starter plan.`,
    }
  }

  if (usage.servicesCount && usage.servicesCount >= TRIAL_CONFIG.maxServices) {
    return {
      allowed: false,
      reason: `Service limit reached (${TRIAL_CONFIG.maxServices}). Upgrade to Starter plan.`,
    }
  }

  return { allowed: true }
}

export function getTrialWarnings(expiresAt: Date): string[] {
  const warnings: string[] = []
  const now = new Date()
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysRemaining <= 7) {
    warnings.push(`Trial expires in ${daysRemaining} days. Upgrade to keep your business online.`)
  } else if (daysRemaining <= 14) {
    warnings.push(`Trial expires in ${daysRemaining} days. Choose a plan to continue.`)
  } else if (daysRemaining <= 30) {
    warnings.push(`Trial expires in ${daysRemaining} days. Explore our pricing plans.`)
  }

  return warnings
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}
