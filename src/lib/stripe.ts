import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set")
  }
  _stripe = new Stripe(secretKey, {
    apiVersion: "2026-07-29.dahlia",
  })
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop]
  },
})

export const PLANS = {
  FREE: { name: "Free Trial", price: 0, stripePriceId: null, maxBookings: 1000, maxStaff: 10, maxServices: 50 },
  STARTER: { name: "Starter", price: 15, stripePriceId: process.env.STRIPE_STARTER_PRICE_ID ?? null, maxBookings: 5000, maxStaff: 25, maxServices: 100 },
  PRO: { name: "Professional", price: 30, stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null, maxBookings: 20000, maxStaff: 100, maxServices: 500 },
  BUSINESS: { name: "Business", price: 75, stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? null, maxBookings: -1, maxStaff: -1, maxServices: -1 },
} as const

export type PlanKey = keyof typeof PLANS
