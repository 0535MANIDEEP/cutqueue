export const TRIAL_DAYS = 90

export interface PlanLimits {
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

export const PLAN_LIMITS: Record<string, PlanLimits> = {
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
      "WhatsApp sharing (manual)",
      "Basic analytics dashboard",
      "Up to 5 staff members",
      "Customer reviews",
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
      "Auto WhatsApp on call",
      "Portfolio gallery",
      "Priority support",
      "Custom branding",
      "Up to 15 staff members",
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}
