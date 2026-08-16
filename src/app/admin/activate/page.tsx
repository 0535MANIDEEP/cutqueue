"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"

export default function AdminActivatePage() {
  const [shopSlug, setShopSlug] = useState("")
  const [plan, setPlan] = useState("STARTER")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleActivate = async () => {
    if (!shopSlug) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/admin/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopSlug, plan }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false, message: "Failed to activate" })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Activate Shop Plan</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Slug</label>
              <input
                type="text"
                value={shopSlug}
                onChange={(e) => setShopSlug(e.target.value)}
                placeholder="my-barbershop"
                className="w-full border border-gray-200 rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3"
              >
                <option value="FREE">Free Trial</option>
                <option value="STARTER">Starter (₹499/mo)</option>
                <option value="PRO">Professional (₹999/mo)</option>
                <option value="BUSINESS">Business (₹1,999/mo)</option>
              </select>
            </div>

            <button
              onClick={handleActivate}
              disabled={!shopSlug || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Activating..." : "Activate Plan"}
            </button>
          </div>

          {result && (
            <div className={`mt-4 p-4 rounded-xl text-sm ${result.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {result.message}
            </div>
          )}

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. Shop owner pays you via UPI QR</li>
              <li>2. They send you screenshot</li>
              <li>3. You come here, enter their shop slug</li>
              <li>4. Select the plan they paid for</li>
              <li>5. Click Activate - done!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
