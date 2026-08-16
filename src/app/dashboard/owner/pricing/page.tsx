"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"

const PLANS = [
  { key: "STARTER", name: "Starter", price: 499, features: ["10 staff", "5000 bookings/mo", "WhatsApp alerts", "Basic analytics"] },
  { key: "PRO", name: "Professional", price: 999, features: ["25 staff", "20000 bookings/mo", "Rewards system", "GST invoices", "Priority support"] },
  { key: "BUSINESS", name: "Business", price: 1999, features: ["Unlimited staff", "Unlimited bookings", "Multi-location", "API access", "Dedicated support"] },
]

export default function OwnerPricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [upiId, setUpiId] = useState("")

  const plan = PLANS.find((p) => p.key === selectedPlan)

  const getUpiUrl = () => {
    if (!plan || !upiId) return ""
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("QueueForge")}&am=${plan.price}&cu=INR&tn=${encodeURIComponent(plan.name + " Plan - QueueForge")}`
  }

  const getQrUrl = () => {
    const upiUrl = getUpiUrl()
    if (!upiUrl) return ""
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUrl)}&margin=10&color=1a1a2e&bgcolor=ffffff`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h1>
          <p className="text-lg text-gray-600">Choose a plan, scan QR, pay via any UPI app</p>
        </div>

        {!showQR ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((p) => (
              <div
                key={p.key}
                className={`bg-white rounded-2xl p-8 shadow-sm border-2 cursor-pointer transition-all hover:shadow-lg ${
                  p.key === "PRO" ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-100"
                }`}
                onClick={() => {
                  setSelectedPlan(p.key)
                  setShowQR(true)
                }}
              >
                {p.key === "PRO" && (
                  <div className="text-center mb-4">
                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                <div className="my-6">
                  <span className="text-4xl font-bold text-gray-900">₹{p.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 px-6 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition">
                  Select {p.name}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan?.name} Plan</h2>
              <p className="text-3xl font-bold text-blue-600 mb-6">₹{plan?.price}/month</p>

              <div className="mb-6">
                <label className="block text-sm text-gray-500 mb-2">Enter your UPI ID (to verify payment)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center"
                />
              </div>

              {upiId && (
                <div className="mb-6">
                  <img src={getQrUrl()} alt="UPI QR Code" className="mx-auto rounded-xl" width={300} height={300} />
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-medium text-blue-800 mb-2">How to pay:</p>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Open any UPI app (PhonePe, GPay, Paytm)</li>
                  <li>2. Scan the QR code above</li>
                  <li>3. Pay ₹{plan?.price}</li>
                  <li>4. Send screenshot to owner on WhatsApp</li>
                  <li>5. We activate your plan within 1 hour</li>
                </ol>
              </div>

              <button
                onClick={() => {
                  setShowQR(false)
                  setSelectedPlan(null)
                  setUpiId("")
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Back to plans
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
