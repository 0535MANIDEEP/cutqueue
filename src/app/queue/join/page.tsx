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
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [shops, setShops] = useState<{ id: string; slug: string; name: string }[]>([])
  const [showPicker, setShowPicker] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get("shop")
    if (slug) setShopSlug(slug)
    fetch("/api/shops").then(r => r.json()).then(d => {
      const list = Array.isArray(d) ? d : d.shops || d.businesses || []
      if (Array.isArray(list)) setShops(list.slice(0, 12))
    }).catch(() => {})
  }, [])
  const [businessIdForUrl, setBusinessIdForUrl] = useState<string>("")
  const joinQueue = useCallback(async () => {
    if (!shopSlug) return
    if (!guestName.trim() || !guestPhone.trim()) { setError("Name + phone required for guest join (no signup needed)"); return }
    setLoading(true); setError("")
    try {
      const shop = shops.find((s) => s.slug === shopSlug || s.id === shopSlug) || (await fetch("/api/shops").then(r=>r.json()).then(d => (Array.isArray(d)?d:[]).find((s:any)=>s.slug===shopSlug||s.id===shopSlug)))
      if (!shop) { setError("Shop not found. Pick from list or check code."); setLoading(false); return }
      setBusinessIdForUrl(shop.id)
      const res = await fetch("/api/queue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId: shop.id, serviceType: "walk-in", guestName: guestName.trim(), guestPhone: guestPhone.trim() }) })
      const data = await res.json()
      if (!res.ok || data.error) setError(data.error || "Failed to join"); else { setTicket(data.ticketNumber); setPosition(data.position || null); setShopName(shop.name || shopSlug) }
    } catch { setError("Failed to join queue. Try again.") }
    setLoading(false)
  }, [shopSlug, shops, guestName, guestPhone])
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
          <h1 className="text-2xl font-black text-[#EFE9DA] mb-1">You&apos;re in Queue!</h1><p className="text-[#EFE9DA]/50 mb-4">{shopName} • Ticket #{ticket} daily</p>
          <div className="bg-[#0A0F0D] border border-[#263329] rounded-2xl p-5 mb-4">
            <p className="text-xs font-mono tracking-widest text-[#EFE9DA]/30 uppercase">Position</p><p className="text-5xl font-black text-[#E8B547]">{position ?? "-"}</p><p className="text-xs text-[#EFE9DA]/30">Ticket #{ticket} • Keep page open</p>
          </div>
          <button onClick={shareOnWhatsApp} className="w-full bg-emerald-500 text-white py-3 rounded-full font-bold">Share on WhatsApp</button>
          <a href={businessIdForUrl ? `/queue/status?businessId=${businessIdForUrl}&ticket=${ticket}` : "#"} className="mt-3 inline-block text-sm text-[#E8B547]">Track live →</a>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4">
      <div className="bg-[#141C18] border border-[#263329] rounded-[20px] p-6 max-w-sm w-full">
        <div className="w-12 h-12 rounded-2xl bg-[#E8B547] flex items-center justify-center mx-auto mb-3 text-[#0A0F0D] text-xl">◉</div>
        <h1 className="text-xl font-black text-[#EFE9DA] text-center">Join Queue — no signup</h1><p className="text-[#EFE9DA]/50 text-center text-sm mb-4">QR or pick shop • Phone only • 10 sec</p>
        <div className="space-y-3">
          <div><label className="text-xs font-mono tracking-widest text-[#EFE9DA]/40 uppercase">Your name</label><input value={guestName} onChange={e=>setGuestName(e.target.value)} placeholder="Rahul" className="w-full mt-1 bg-[#0A0F0D] border border-[#263329] rounded-xl px-3 py-3 text-[#EFE9DA] placeholder:text-[#EFE9DA]/30 focus:border-[#E8B547]/50 outline-none" /></div>
          <div><label className="text-xs font-mono tracking-widest text-[#EFE9DA]/40 uppercase">Phone (WhatsApp)</label><input value={guestPhone} onChange={e=>setGuestPhone(e.target.value)} placeholder="98765 43210" className="w-full mt-1 bg-[#0A0F0D] border border-[#263329] rounded-xl px-3 py-3 text-[#EFE9DA] placeholder:text-[#EFE9DA]/30 focus:border-[#E8B547]/50 outline-none" /></div>
          <div><label className="text-xs font-mono tracking-widest text-[#EFE9DA]/40 uppercase">Shop</label>
            <div className="mt-1 flex gap-2"><input value={shopSlug} onChange={e=>setShopSlug(e.target.value)} placeholder="my-barbershop" className="flex-1 bg-[#0A0F0D] border border-[#263329] rounded-xl px-3 py-3 text-[#EFE9DA] placeholder:text-[#EFE9DA]/30 focus:border-[#E8B547]/50 outline-none text-sm" /><button onClick={()=>setShowPicker(!showPicker)} className="px-3 py-3 rounded-xl bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA] text-xs">Pick</button></div>
            {showPicker && <div className="mt-2 max-h-40 overflow-auto rounded-xl border border-[#263329] bg-[#0A0F0D] divide-y divide-[#1A2320]">{shops.length? shops.map(s=><button key={s.id} onClick={()=>{setShopSlug(s.slug); setShowPicker(false)}} className="w-full text-left px-3 py-2 text-sm text-[#EFE9DA] hover:bg-[#141C18]">{s.name} <span className="text-[#EFE9DA]/30">• {s.slug}</span></button>): <div className="px-3 py-2 text-xs text-[#EFE9DA]/30">No shops yet — owner must onboard first</div>}</div>}
          </div>
        </div>
        {error && <div className="mt-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-3 text-sm">{error}</div>}
        <button onClick={joinQueue} disabled={!shopSlug || loading} className="mt-4 w-full bg-[#E8B547] text-[#0A0F0D] py-3 rounded-full font-black disabled:opacity-50">{loading ? "Joining..." : "Join Queue →"}</button>
        <p className="text-xs text-[#EFE9DA]/20 text-center mt-3">No signup • Shop code typed? Pick from list instead</p>
      </div>
    </div>
  )
}
