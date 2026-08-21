"use client"
import { useState, useEffect, useCallback } from "react"
import { joinTemplate, getWaUrlForTemplate, statusUrlFor } from "@/lib/whatsapp-templates"
export default function QueueJoinPage() {
  const [shopSlug, setShopSlug] = useState("")
  const [ticket, setTicket] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [position, setPosition] = useState<number | null>(null)
  const [shopName, setShopName] = useState("")
  useEffect(() => { const params = new URLSearchParams(window.location.search); const slug = params.get("shop"); if (slug) setShopSlug(slug) }, [])
  const joinQueue = useCallback(async () => {
    if (!shopSlug) return; setLoading(true); setError("")
    try {
      const shopsRes = await fetch("/api/shops"); const shops = await shopsRes.json()
      const shop = shops.find((s: { slug: string; id: string }) => s.slug === shopSlug || s.id === shopSlug)
      if (!shop) { setError("Shop not found. Check the shop code and try again."); setLoading(false); return }
      setBusinessIdForUrl(shop.id)
      const res = await fetch("/api/queue/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId: shop.id, serviceType: "walk-in" }) })
      const data = await res.json()
      if (data.error) setError(data.error); else { setTicket(data.ticketNumber); setPosition(data.position || null); setShopName(shop.name || shopSlug) }
    } catch { setError("Failed to join queue. Try again.") }
    setLoading(false)
  }, [shopSlug])
  const [businessIdForUrl, setBusinessIdForUrl] = useState<string>("")
  const shareOnWhatsApp = () => {
    if (!ticket) return
    const url = businessIdForUrl ? statusUrlFor(businessIdForUrl, ticket) : ""
    const msg = joinTemplate({ shopName, ticket, position, statusUrl: url })
    window.open(getWaUrlForTemplate(msg), "_blank")
  }
  if (ticket) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4">
        <div className="bg-[#141C18] border border-[#263329] rounded-[20px] p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4 text-white text-2xl">✓</div>
          <h1 className="text-2xl font-black text-[#EFE9DA] mb-1">You&apos;re in Queue!</h1>
          <p className="text-[#EFE9DA]/50 mb-6">{shopName}</p>
          <div className="bg-[#0A0F0D] border border-[#263329] rounded-2xl p-6 mb-6">
            <p className="text-xs font-mono tracking-widest text-[#EFE9DA]/30 uppercase mb-1">Your Ticket</p>
            <p className="text-5xl font-black text-[#E8B547]">#{ticket}</p>
            <p className="text-xs text-[#EFE9DA]/30 mt-1">Keep this page open</p>
          </div>
          {position && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#0A0F0D] border border-[#263329] rounded-2xl p-4"><p className="text-xs font-mono tracking-widest text-[#EFE9DA]/30 uppercase">Position</p><p className="text-2xl font-black text-[#EFE9DA]">{position}</p></div>
              <div className="bg-[#E8B547] rounded-2xl p-4"><p className="text-xs font-mono tracking-widest text-[#0A0F0D]/60 uppercase">Status</p><p className="text-sm font-black text-[#0A0F0D]">Waiting</p></div>
            </div>
          )}
          <button onClick={shareOnWhatsApp} className="w-full bg-emerald-500 text-white py-3 rounded-full font-bold hover:bg-emerald-600 transition mb-3">Share on WhatsApp</button>
          <p className="text-xs text-[#EFE9DA]/30">We&apos;ll notify you when it&apos;s your turn</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4">
      <div className="bg-[#141C18] border border-[#263329] rounded-[20px] p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#E8B547] flex items-center justify-center mx-auto mb-4 text-[#0A0F0D] text-2xl">◉</div>
        <h1 className="text-2xl font-black text-[#EFE9DA] mb-1">Join Queue</h1>
        <p className="text-[#EFE9DA]/50 mb-6">Scan QR or enter shop code</p>
        <div className="mb-4"><input type="text" value={shopSlug} onChange={(e) => setShopSlug(e.target.value)} placeholder="my-barbershop" className="w-full bg-[#0A0F0D] border border-[#263329] rounded-xl px-4 py-3 text-center text-lg text-[#EFE9DA] placeholder:text-[#EFE9DA]/30 focus:outline-none focus:border-[#E8B547]/50" /></div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-3 mb-4 text-sm">{error}</div>}
        <button onClick={joinQueue} disabled={!shopSlug || loading} className="w-full bg-[#E8B547] text-[#0A0F0D] py-3 rounded-full font-black hover:bg-[#E8B547]/90 transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "Joining..." : "Join Queue →"}</button>
        <p className="text-xs text-[#EFE9DA]/20 mt-4">No app needed • Works on any phone</p>
      </div>
    </div>
  )
}
