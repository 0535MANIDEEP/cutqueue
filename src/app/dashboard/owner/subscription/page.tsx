"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { PRICING_TIERS } from "@/lib/plans"

interface BusinessPlan {
  plan: string
  expiresAt: string | null
  isActive: boolean
  daysRemaining: number
}

export default function SubscriptionPage() {
  const [planStatus, setPlanStatus] = useState<BusinessPlan | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [upiId, setUpiId] = useState("")

  useEffect(() => {
    fetch("/api/trial")
      .then((r) => r.json())
      .then((d) => {
        setPlanStatus({
          plan: d.business?.plan || "FREE",
          expiresAt: d.expiresAt,
          isActive: d.isActive,
          daysRemaining: d.daysRemaining,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const plans = Object.entries(PRICING_TIERS)

  const generateUpiLink = (planKey: string, amount: number) => {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId || "queueforge@upi")}&pn=${encodeURIComponent("QueueForge")}&am=${amount}&cu=INR&tn=${encodeURIComponent(`QueueForge ${PRICING_TIERS[planKey as keyof typeof PRICING_TIERS].name} Plan - Monthly`)}`
    return upiUrl
  }

  const getQrUrl = (upiLink: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}&bgcolor=0F1B17&color=E8B547`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Current Plan Banner */}
        {planStatus && (
          <div className={`rounded-xl p-4 mb-8 border ${
            planStatus.plan === "FREE"
              ? "bg-amber-50 border-amber-200"
              : "bg-emerald-50 border-emerald-200"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Plan</p>
                <p className="text-xl font-bold text-gray-900">
                  {PRICING_TIERS[planStatus.plan as keyof typeof PRICING_TIERS]?.name || planStatus.plan}
                </p>
              </div>
              <div className="text-right">
                {planStatus.plan === "FREE" && planStatus.daysRemaining > 0 ? (
                  <p className="text-sm text-amber-700">
                    {planStatus.daysRemaining} days trial remaining
                  </p>
                ) : planStatus.plan === "FREE" ? (
                  <p className="text-sm text-red-600 font-medium">Trial expired</p>
                ) : (
                  <p className="text-sm text-emerald-700">Active plan</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
          <p className="text-gray-500">Start with a 90-day free trial. No credit card required.</p>
        </div>

        {/* UPI ID Setup */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-8 max-w-md mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your UPI ID (for QR code)
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@upi"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Leave empty to use default (queueforge@upi)
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {plans.map(([key, plan]) => {
            const isCurrent = planStatus?.plan === key
            const isPopular = key === "PRO"

            return (
              <div
                key={key}
                className={`relative bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
                  selectedPlan === key
                    ? "border-blue-500 shadow-lg scale-[1.02]"
                    : isCurrent
                      ? "border-emerald-300 bg-emerald-50/50"
                      : "border-gray-100 hover:border-gray-200"
                } ${isPopular ? "ring-2 ring-blue-500/20" : ""}`}
                onClick={() => !isCurrent && setSelectedPlan(key)}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    CURRENT PLAN
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.priceLabel}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="text-xs text-gray-400 space-y-1">
                  <p>{plan.bookingsPerMonth} bookings/mo</p>
                  <p>{plan.staff} staff members</p>
                  <p>{plan.services} services</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Payment Section */}
        {selectedPlan && selectedPlan !== "FREE" && !planStatus?.isActive && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
              Pay with UPI
            </h3>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Amount to pay</p>
              <p className="text-3xl font-bold text-gray-900">
                {PRICING_TIERS[selectedPlan as keyof typeof PRICING_TIERS].priceLabel}
              </p>
              <p className="text-xs text-gray-400">per month</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-xl border border-gray-200">
                <img
                  src={getQrUrl(
                    generateUpiLink(
                      selectedPlan,
                      PRICING_TIERS[selectedPlan as keyof typeof PRICING_TIERS].price
                    )
                  )}
                  alt="UPI QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="text-center mb-4">
              <p className="text-xs text-gray-400">
                Scan with any UPI app (GPay, PhonePe, Paytm, etc.)
              </p>
            </div>

            {/* UPI Link */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Or pay via UPI link:</p>
              <a
                href={generateUpiLink(
                  selectedPlan,
                  PRICING_TIERS[selectedPlan as keyof typeof PRICING_TIERS].price
                )}
                className="text-sm text-blue-600 hover:underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tap to pay with UPI
              </a>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900">How to activate:</p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Scan the QR code and pay</li>
                <li>Take a screenshot of the payment confirmation</li>
                <li>Send the screenshot to the admin</li>
                <li>Your plan will be activated within 24 hours</li>
              </ol>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                Admin WhatsApp: +91 98765 43210 | Email: admin@queueforge.in
              </p>
            </div>
          </div>
        )}

        {/* Already on paid plan */}
        {planStatus?.isActive && planStatus.plan !== "FREE" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re on the {PRICING_TIERS[planStatus.plan as keyof typeof PRICING_TIERS]?.name} plan</h3>
            <p className="text-gray-500">
              {planStatus.daysRemaining > 0
                ? `Renews in ${planStatus.daysRemaining} days`
                : "Contact admin to renew"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
