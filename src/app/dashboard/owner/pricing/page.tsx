"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"

const PLANS = [
  {
    key: "FREE",
    name: "Free Trial",
    price: 0,
    period: "90 days",
    features: [
      "1,000 bookings/month",
      "10 staff members",
      "50 services",
      "Queue management",
      "Basic notifications",
      "Email support",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    key: "STARTER",
    name: "Starter",
    price: 15,
    period: "/month",
    features: [
      "5,000 bookings/month",
      "25 staff members",
      "100 services",
      "SMS notifications",
      "Portfolio gallery",
      "Customer reviews",
      "Priority support",
    ],
    cta: "Upgrade to Starter",
    disabled: false,
    popular: false,
  },
  {
    key: "PRO",
    name: "Professional",
    price: 30,
    period: "/month",
    features: [
      "20,000 bookings/month",
      "100 staff members",
      "500 services",
      "SMS + Email notifications",
      "Analytics dashboard",
      "IVR/Call-in queue",
      "Points & rewards system",
      "Custom branding",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    disabled: false,
    popular: true,
  },
  {
    key: "BUSINESS",
    name: "Business",
    price: 75,
    period: "/month",
    features: [
      "Unlimited bookings",
      "Unlimited staff",
      "Unlimited services",
      "All notification channels",
      "Advanced analytics",
      "API access",
      "Custom integrations",
      "Multi-location support",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Upgrade to Business",
    disabled: false,
    popular: false,
  },
]

export default function OwnerPricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (plan: string) => {
    setLoading(plan)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Checkout error:", error)
    }
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600">Start free for 90 days. Upgrade when you&apos;re ready.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`bg-white rounded-2xl p-8 shadow-sm border-2 transition-all hover:shadow-lg ${
                plan.popular
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-100"
              }`}
            >
              {plan.popular && (
                <div className="text-center mb-4">
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>

              <div className="my-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-500">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.key)}
                disabled={plan.disabled || loading === plan.key}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition ${
                  plan.disabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : plan.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {loading === plan.key ? "Loading..." : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
