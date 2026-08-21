"use client"

import { useState, useEffect, useCallback } from "react"

export default function QueueJoinPage() {
  const [shopSlug, setShopSlug] = useState("")
  const [ticket, setTicket] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [position, setPosition] = useState<number | null>(null)
  const [shopName, setShopName] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get("shop")
    if (slug) setShopSlug(slug)
  }, [])

  const joinQueue = useCallback(async () => {
    if (!shopSlug) return
    setLoading(true)
    setError("")

    try {
      const shopsRes = await fetch("/api/shops")
      const shops = await shopsRes.json()
      const shop = shops.find((s: { slug: string; id: string }) => s.slug === shopSlug || s.id === shopSlug)

      if (!shop) {
        setError("Shop not found. Check the shop code and try again.")
        setLoading(false)
        return
      }

      const res = await fetch("/api/queue/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: shop.id,
          serviceType: "walk-in",
        }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setTicket(data.ticketNumber)
        setPosition(data.position || null)
        setShopName(shop.name || shopSlug)
      }
    } catch {
      setError("Failed to join queue. Try again.")
    }
    setLoading(false)
  }, [shopSlug])

  const shareOnWhatsApp = () => {
    if (!ticket) return
    const message = encodeURIComponent(
      `\u{1F7E2} *${shopName}*\n\nYour ticket *#${ticket}* is active!\n\nPosition: ${position}\n\nWe'll notify you when it's your turn!`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  if (ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">&#x2705;</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re in Queue!</h1>
          <p className="text-gray-500 mb-6">{shopName}</p>

          <div className="bg-emerald-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">Your Ticket</p>
            <p className="text-5xl font-bold text-emerald-600">#{ticket}</p>
          </div>

          {position && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Position</p>
                <p className="text-2xl font-bold">{position}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-bold text-amber-600">Waiting</p>
              </div>
            </div>
          )}

          <button
            onClick={shareOnWhatsApp}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition mb-3"
          >
            Share on WhatsApp
          </button>

          <p className="text-xs text-gray-400">
            We&apos;ll notify you when it&apos;s your turn
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">&#x1F4E1;</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Queue</h1>
        <p className="text-gray-500 mb-6">Scan the QR code or enter shop code</p>

        <div className="mb-6">
          <input
            type="text"
            value={shopSlug}
            onChange={(e) => setShopSlug(e.target.value)}
            placeholder="Shop code (e.g. my-barbershop)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-lg"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={joinQueue}
          disabled={!shopSlug || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Joining..." : "Join Queue"}
        </button>
      </div>
    </div>
  )
}
