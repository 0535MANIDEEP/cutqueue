"use client"
import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/layout/header"
import { TRIAL_DAYS } from "@/lib/plans"
import { callNextTemplate, joinTemplate, getWaUrlForTemplate, isPremium, delayTemplate, queuePausedTemplate, bookingCancelledByBusinessTemplate, serviceDoneTemplate, bookForSomeoneProxyTemplate, monthlyRemainderTemplate } from "@/lib/whatsapp-templates"
function MonthlyRemainder({ businessId }: { businessId: string | null }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [service, setService] = useState("Haircut")
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Customer name" className="flex-1 bg-[#0A0F0D] border border-[#263329] rounded-xl px-3 py-2 text-sm text-[#EFE9DA] placeholder:text-[#EFE9DA]/30" />
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="98765 43210" className="flex-1 bg-[#0A0F0D] border border-[#263329] rounded-xl px-3 py-2 text-sm text-[#EFE9DA] placeholder:text-[#EFE9DA]/30" />
      <input value={service} onChange={e=>setService(e.target.value)} placeholder="Service" className="w-[110px] bg-[#0A0F0D] border border-[#263329] rounded-xl px-3 py-2 text-sm text-[#EFE9DA]" />
      <button onClick={() => { if(!name||!phone) return; const msg = monthlyRemainderTemplate({ shopName: "Your shop", customerName: name, serviceName: service, shopSlug: businessId || "demo" }); window.open(getWaUrlForTemplate(msg, phone), "_blank") }} className="px-4 py-2 rounded-full bg-emerald-500 text-white font-bold text-sm">Send WA</button>
    </div>
  )
}
interface QueueEntry { id: string; ticketNumber: number; status: string; serviceType: string; joinedAt: string; customerId: string; customer: { name: string }; position: number | null }
interface Booking { id: string; scheduledAt: string; status: string; customer: { name: string }; service: { name: string } }
export default function OwnerDashboard() {
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<{ id: string; name: string }[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [tab, setTab] = useState<"queue" | "bookings">("queue")
  const [error, setError] = useState("")
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [walkInName, setWalkInName] = useState("")
  const [walkInPhone, setWalkInPhone] = useState("")
  const [walkInService, setWalkInService] = useState("")
  const [addingWalkIn, setAddingWalkIn] = useState(false)
  const [invoiceGenerating, setInvoiceGenerating] = useState<string | null>(null)
  const [generatedInvoice, setGeneratedInvoice] = useState<Record<string, unknown> | null>(null)
  const [invoiceAmount, setInvoiceAmount] = useState("")
  const [invoiceEntryId, setInvoiceEntryId] = useState<string | null>(null)
  const [invoiceServiceName, setInvoiceServiceName] = useState("")
  const fetchData = useCallback(async (bid: string) => {
    try {
      const [queueRes, bookingsRes, servicesRes] = await Promise.all([fetch(`/api/queue?businessId=${bid}`), fetch(`/api/bookings?businessId=${bid}`), fetch(`/api/services?businessId=${bid}`)])
      if (queueRes.ok) { const d = await queueRes.json(); setQueue(d.entries || []) }
      if (bookingsRes.ok) { const d = await bookingsRes.json(); setBookings(Array.isArray(d) ? d : d.bookings || []) }
      if (servicesRes.ok) { const d = await servicesRes.json(); setServices(Array.isArray(d) ? d : []) }
    } catch { setError("Failed to load data") }
  }, [])
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [plan, setPlan] = useState<string>("FREE")
  useEffect(() => {
    fetch("/api/business/settings").then(r => { if (!r.ok) throw new Error("x"); return r.json() }).then(data => {
      if (data?.id) {
        setBusinessId(data.id); setPlan(data.plan || "FREE")
        const now = new Date(); const createdAt = new Date(data.createdAt); const plan = data.plan || "FREE"
        if (plan === "FREE") {
          const expiryAt = data.planExpiresAt ? new Date(data.planExpiresAt) : new Date(createdAt)
          if (!data.planExpiresAt) expiryAt.setDate(expiryAt.getDate() + TRIAL_DAYS)
          const diffMs = expiryAt.getTime() - now.getTime()
          const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
          setTrialDaysRemaining(days)
          if (days <= 15) setShowUpgrade(true)
        } else setTrialDaysRemaining(null)
      }
    }).catch(() => setError("Failed to load business settings"))
  }, [])
  useEffect(() => { if (!businessId) return; fetchData(businessId); const interval = setInterval(() => fetchData(businessId), 5000); return () => clearInterval(interval) }, [businessId, fetchData])
  const addWalkIn = async () => {
    if (!walkInName.trim() || !businessId) return
    setAddingWalkIn(true)
    try {
      const res = await fetch("/api/queue/walkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId, customerName: walkInName.trim(), customerPhone: walkInPhone.trim() || undefined, serviceType: walkInService || "General" }) })
      if (!res.ok) { const err = await res.json(); setError(err.error || "Failed to add walk-in"); return }
      setWalkInName(""); setWalkInPhone(""); setWalkInService(""); setShowWalkIn(false); if (businessId) fetchData(businessId)
    } catch { setError("Network error") } finally { setAddingWalkIn(false) }
  }
  const callNext = async (entryId: string) => { try { const res = await fetch(`/api/queue/${entryId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "call" }) }); if (!res.ok) { const err = await res.json(); setError(err.error || "Failed to call next"); return } if (businessId) fetchData(businessId) } catch { setError("Network error") } }
  const completeService = async (entryId: string) => { try { const res = await fetch(`/api/queue/${entryId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "complete" }) }); if (!res.ok) { const err = await res.json(); setError(err.error || "Failed to complete"); return } if (businessId) fetchData(businessId) } catch { setError("Network error") } }
  const confirmBooking = async (bookingId: string) => { try { const res = await fetch("/api/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, status: "CONFIRMED" }) }); if (!res.ok) { const err = await res.json(); setError(err.error || "Failed to confirm booking"); return } if (businessId) fetchData(businessId) } catch { setError("Network error") } }
  const generateInvoice = async (entryId: string, serviceName: string) => { if (!businessId) return; setInvoiceEntryId(entryId); setInvoiceServiceName(serviceName); setInvoiceAmount("") }
  const submitInvoice = async () => {
    if (!businessId || !invoiceEntryId || !invoiceAmount) return
    setInvoiceGenerating(invoiceEntryId)
    try { const res = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId, queueEntryId: invoiceEntryId, serviceName: invoiceServiceName, amount: Number(invoiceAmount) }) }); if (!res.ok) { const err = await res.json(); setError(err.error || "Failed to generate invoice"); return } const invoice = await res.json(); setGeneratedInvoice(invoice); setInvoiceEntryId(null) } catch { setError("Network error") } finally { setInvoiceGenerating(null) }
  }
  const waiting = queue.filter(e => e.status === "WAITING")
  const serving = queue.filter(e => e.status === "CALLED" || e.status === "IN_PROGRESS")
  const todayStr = new Date().toLocaleDateString("en-CA")
  const todayBookings = bookings.filter(b => new Date(b.scheduledAt).toLocaleDateString("en-CA") === todayStr)
  return (
    <div className="min-h-screen bg-[#0A0F0D]">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center justify-between"><span>{error}</span><button onClick={() => setError("")} className="text-red-300 hover:text-white font-bold ml-4">×</button></div>}
        {showUpgrade && (
          <div className="mb-6 p-5 rounded-[16px] bg-[#E8B547] text-[#0A0F0D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3"><div className="w-12 h-12 rounded-xl bg-[#0A0F0D] text-[#E8B547] flex items-center justify-center font-black text-sm shrink-0">{trialDaysRemaining ?? "—"}</div><div><h3 className="font-bold">Trial ending soon</h3><p className="text-sm text-[#0A0F0D]/70">Your 90-day trial ends in {trialDaysRemaining} days. Upgrade to Pro to stay live.</p></div></div>
            <div className="flex gap-2 w-full sm:w-auto"><button onClick={() => setShowUpgrade(false)} className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-white/80 text-[#0A0F0D] font-semibold text-sm">Later</button><a href="/dashboard/owner/subscription" className="flex-1 sm:flex-none px-5 py-2 rounded-full bg-[#0A0F0D] text-white font-bold text-sm text-center">View plans →</a></div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-2xl bg-[#141C18] border border-[#263329] p-4 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-[#E8B547]/10 rounded-full blur-xl" />
            <p className="text-xs font-mono tracking-widest text-[#EFE9DA]/40 uppercase">Waiting</p>
            <p className="text-3xl font-black text-[#EFE9DA] mt-1">{waiting.length}</p>
            <p className="text-xs text-[#EFE9DA]/40">in line</p>
          </div>
          <div className="rounded-2xl bg-[#141C18] border border-[#263329] p-4 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl" />
            <p className="text-xs font-mono tracking-widest text-[#EFE9DA]/40 uppercase">Serving</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">{serving.length}</p>
            <p className="text-xs text-[#EFE9DA]/40">active</p>
          </div>
          <div className="rounded-2xl bg-[#141C18] border border-[#263329] p-4 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/5 rounded-full blur-xl" />
            <p className="text-xs font-mono tracking-widest text-[#EFE9DA]/40 uppercase">Bookings</p>
            <p className="text-3xl font-black text-[#EFE9DA] mt-1">{todayBookings.length}</p>
            <p className="text-xs text-[#EFE9DA]/40">today</p>
          </div>
        </div>
        {waiting.length > 0 && (
          <div className="mb-5 rounded-2xl bg-[#111815] border border-[#263329] p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3"><span className="text-xs font-mono tracking-widest text-[#EFE9DA]/40 uppercase">Visual queue</span><span className="text-xs px-2 py-1 rounded-full bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]/50">Auto-updates • 5s</span></div>
            <div className="relative h-[72px]">
              <div className="absolute top-[34px] left-2 right-2 h-[2px] bg-[#1E2528] rounded-full" />
              <div className="absolute inset-0 flex items-center justify-between gap-1.5">
                {waiting.slice(0, 8).map((e) => (
                  <div key={e.id} className="flex flex-col items-center gap-1">
                    <div className="w-[56px] h-[48px] rounded-xl bg-[#0A0F0D] border border-[#263329] flex flex-col items-center justify-center">
                      <span className="text-[10px] font-mono text-[#EFE9DA]/30">#{e.ticketNumber}</span>
                      <span className="text-xs font-bold text-[#EFE9DA] truncate max-w-[52px]">{e.customer?.name?.split(' ')[0] || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {waiting.length > 8 && <p className="text-center text-xs text-[#EFE9DA]/30 mt-1">+{waiting.length - 8} more</p>}
          </div>
        )}
        <div className="flex bg-[#141C18] border border-[#263329] rounded-full p-1 mb-5 w-fit">
          <button onClick={() => setTab("queue")} className={`px-5 py-2 rounded-full text-sm font-semibold transition ${tab === "queue" ? "bg-[#EFE9DA] text-[#0A0F0D]" : "text-[#EFE9DA]/60 hover:text-[#EFE9DA]"}`}>Queue ({waiting.length + serving.length})</button>
          <button onClick={() => setTab("bookings")} className={`px-5 py-2 rounded-full text-sm font-semibold transition ${tab === "bookings" ? "bg-[#EFE9DA] text-[#0A0F0D]" : "text-[#EFE9DA]/60 hover:text-[#EFE9DA]"}`}>Bookings ({todayBookings.length})</button>
        </div>
        {/* Monthly remainder — free via WhatsApp wa.me (₹0) */}
        <div className="mb-5 rounded-2xl bg-[#111815] border border-[#263329] p-4">
          <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-[#EFE9DA]">Monthly remainder — free</h3><span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">₹0 cost</span></div>
          <p className="text-xs text-[#EFE9DA]/50 mb-3">Send “haircut due” WhatsApp to any past customer. No SMS gateway, just prefilled `wa.me` — you tap Send.</p>
          <MonthlyRemainder businessId={businessId} />
          <p className="text-xs text-[#EFE9DA]/30 mt-2">Free now (manual tap). Pro: auto-send monthly to all customers.</p>
        </div>
        {tab === "queue" && (
          <div className="space-y-3">
            {!showWalkIn ? (
              <button onClick={() => setShowWalkIn(true)} className="w-full bg-[#E8B547] text-[#0A0F0D] py-3.5 rounded-full text-[15px] font-black hover:bg-[#E8B547]/90 transition shadow-[0_8px_24px_rgba(232,181,71,0.25)]">+ Add Walk-in</button>
            ) : (
              <div className="bg-[#141C18] border border-[#263329] rounded-2xl p-4 space-y-3">
                <p className="font-bold text-[#EFE9DA]">New Walk-in</p>
                <input type="text" placeholder="Customer name *" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} className="w-full px-3 py-2.5 bg-[#0A0F0D] border border-[#263329] rounded-xl text-sm text-[#EFE9DA] placeholder:text-[#EFE9DA]/30 focus:outline-none focus:border-[#E8B547]/50" autoFocus />
                <input type="tel" placeholder="Phone (optional)" value={walkInPhone} onChange={(e) => setWalkInPhone(e.target.value)} className="w-full px-3 py-2.5 bg-[#0A0F0D] border border-[#263329] rounded-xl text-sm text-[#EFE9DA] placeholder:text-[#EFE9DA]/30 focus:outline-none focus:border-[#E8B547]/50" />
                <select value={walkInService} onChange={(e) => setWalkInService(e.target.value)} className="w-full px-3 py-2.5 bg-[#0A0F0D] border border-[#263329] rounded-xl text-sm text-[#EFE9DA] focus:outline-none">
                  <option value="">Select service</option>{services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}<option value="General">General</option>
                </select>
                <div className="flex gap-2"><button onClick={() => setShowWalkIn(false)} className="flex-1 py-2.5 rounded-full text-sm font-semibold border border-[#263329] text-[#EFE9DA]/70 hover:bg-[#0A0F0D]">Cancel</button><button onClick={addWalkIn} disabled={!walkInName.trim() || addingWalkIn} className="flex-1 py-2.5 rounded-full text-sm font-black bg-[#E8B547] text-[#0A0F0D] hover:bg-[#E8B547]/90 disabled:opacity-50">{addingWalkIn ? "Adding..." : "Add to Queue"}</button></div>
              </div>
            )}
            {serving.length > 0 && (
              <div>
                <h3 className="text-xs font-mono tracking-widest text-[#EFE9DA]/40 uppercase mb-2">Now Serving</h3>
                {serving.map(entry => (
                  <div key={entry.id} className="bg-[#E8B547]/10 border border-[#E8B547]/30 rounded-2xl p-4 mb-2 flex items-center justify-between">
                    <div><p className="font-bold text-[#EFE9DA]">{entry.customer?.name}</p><p className="text-sm text-[#EFE9DA]/60">#{entry.ticketNumber} • {entry.serviceType}</p></div>
                    <div className="flex gap-2"><button onClick={() => { const msg = joinTemplate({ shopName: "Your shop", ticket: entry.ticketNumber, position: null, statusUrl: "" }); window.open(getWaUrlForTemplate(msg), "_blank") }} className="bg-[#141C18] border border-[#263329] text-emerald-400 px-3 py-2 rounded-full text-xs font-bold">WA</button><button onClick={() => generateInvoice(entry.id, entry.serviceType)} disabled={invoiceGenerating === entry.id} className="bg-[#141C18] border border-[#263329] text-[#EFE9DA] px-3 py-2 rounded-full text-sm font-semibold hover:bg-[#1E2528] disabled:opacity-50">{invoiceGenerating === entry.id ? "..." : "Invoice"}</button><button onClick={() => completeService(entry.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-600">Done</button></div>
                  </div>
                ))}
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2"><h3 className="text-xs font-mono tracking-widest text-[#EFE9DA]/40 uppercase">Waiting ({waiting.length})</h3><span className={`text-xs px-2 py-1 rounded-full border ${isPremium(plan) ? 'bg-[#E8B547] text-[#0A0F0D] border-[#E8B547]' : 'bg-[#141C18] text-[#EFE9DA]/40 border-[#263329]'}`}>{isPremium(plan) ? '✓ Auto WhatsApp' : 'Free: manual WhatsApp'}</span></div>
              {!isPremium(plan) && waiting.length > 0 && <div className="mb-3 rounded-xl bg-[#E8B547]/10 border border-[#E8B547]/20 p-3 text-xs text-[#E8B547]">Free: manual WhatsApp (tap to share). <a href="/dashboard/owner/subscription" className="underline font-bold">Upgrade to Pro</a> for auto-send + delays/paused.</div>}
              {waiting.length === 0 ? <div className="bg-[#141C18] border border-[#263329] rounded-2xl p-8 text-center"><p className="text-[#EFE9DA]/30">No one waiting — add a walk-in to start</p></div> : waiting.map((entry) => (
                <div key={entry.id} className="bg-[#141C18] border border-[#263329] rounded-2xl p-4 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#E8B547] flex items-center justify-center text-[#0A0F0D] font-black text-sm">#{entry.ticketNumber}</div><div><p className="font-semibold text-[#EFE9DA]">{entry.customer?.name}</p><p className="text-sm text-[#EFE9DA]/50">{entry.serviceType}</p></div></div>
                    <div className="flex gap-2">
                      <button onClick={() => { const msg = callNextTemplate({ shopName: "Your shop", ticket: entry.ticketNumber, serviceType: entry.serviceType }); window.open(getWaUrlForTemplate(msg), "_blank"); if (isPremium(plan)) callNext(entry.id) }} className={`px-3 py-2 rounded-full text-sm font-bold border ${isPremium(plan) ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[#0A0F0D] text-emerald-400 border-[#263329]'}`}>{isPremium(plan) ? 'Call + WA' : 'WA'}</button>
                      <button onClick={() => callNext(entry.id)} className="bg-[#EFE9DA] text-[#0A0F0D] px-4 py-2 rounded-full text-sm font-bold hover:bg-white transition">Call Next</button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button onClick={() => window.open(getWaUrlForTemplate(delayTemplate({ shopName: "Shop", ticket: entry.ticketNumber, delayMin: 5 })), "_blank")} className="px-3 py-1.5 rounded-full bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]/60 text-xs">⏳ Delay 5m</button>
                    <button onClick={() => window.open(getWaUrlForTemplate(queuePausedTemplate({ shopName: "Shop", resumeTime: "10 min" })), "_blank")} className="px-3 py-1.5 rounded-full bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]/60 text-xs">⏸️ Paused</button>
                    <button onClick={async () => { if (!confirm(`Cancel #${entry.ticketNumber}?`)) return; await fetch(`/api/queue/${entry.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel" }) }); window.open(getWaUrlForTemplate(bookingCancelledByBusinessTemplate({ shopName: "Shop", serviceName: entry.serviceType, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() })), "_blank"); fetchData(businessId!) }} className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs">❌ Cancel</button>
                    <button onClick={() => { const proxy = prompt("Book for whom? Name,phone e.g. Amit,9876543210"); if (!proxy) return; const [n,p]=proxy.split(","); window.open(getWaUrlForTemplate(bookForSomeoneProxyTemplate({ shopName: "Shop", otherName: n||"Friend", serviceName: entry.serviceType, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() }), p), "_blank") }} className="px-3 py-1.5 rounded-full bg-[#E8B547]/15 border border-[#E8B547]/20 text-[#E8B547] text-xs">👥 Book for other</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "bookings" && (
          <div className="space-y-2">
            {todayBookings.length === 0 ? <div className="bg-[#141C18] border border-[#263329] rounded-2xl p-8 text-center"><p className="text-[#EFE9DA]/30">No bookings today</p></div> : todayBookings.map(booking => (
              <div key={booking.id} className="bg-[#141C18] border border-[#263329] rounded-2xl p-4 flex items-center justify-between">
                <div><p className="font-semibold text-[#EFE9DA]">{booking.customer?.name}</p><p className="text-sm text-[#EFE9DA]/50">{booking.service?.name} • {new Date(booking.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p></div>
                {booking.status === "PENDING" ? <button onClick={() => confirmBooking(booking.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-600">Confirm</button> : <span className="text-sm text-emerald-400 font-semibold">Confirmed</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      {invoiceEntryId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141C18] border border-[#263329] rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-[#EFE9DA] mb-1">Generate Invoice</h3><p className="text-sm text-[#EFE9DA]/50 mb-3">{invoiceServiceName}</p>
            <label className="text-xs font-mono tracking-widest text-[#EFE9DA]/40 uppercase">Amount (₹)</label>
            <input type="number" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} placeholder="0.00" className="w-full mt-1 px-3 py-3 bg-[#0A0F0D] border border-[#263329] rounded-xl text-lg font-bold text-[#EFE9DA] focus:outline-none focus:border-[#E8B547]/50" autoFocus min="0" step="0.01" />
            {invoiceAmount && <div className="mt-3 rounded-xl bg-[#0A0F0D] border border-[#263329] p-3 text-sm space-y-1"><div className="flex justify-between text-[#EFE9DA]/60"><span>Subtotal</span><span>₹{Number(invoiceAmount).toFixed(2)}</span></div><div className="flex justify-between text-[#EFE9DA]/60"><span>CGST 2.5%</span><span>₹{(Number(invoiceAmount) * 0.025).toFixed(2)}</span></div><div className="flex justify-between text-[#EFE9DA]/60"><span>SGST 2.5%</span><span>₹{(Number(invoiceAmount) * 0.025).toFixed(2)}</span></div><div className="flex justify-between font-black text-[#EFE9DA] pt-2 border-t border-[#263329]"><span>Total</span><span>₹{(Number(invoiceAmount) * 1.05).toFixed(2)}</span></div></div>}
            <div className="flex gap-2 mt-4"><button onClick={() => setInvoiceEntryId(null)} className="flex-1 py-2.5 rounded-full border border-[#263329] text-[#EFE9DA]/70 font-semibold">Cancel</button><button onClick={submitInvoice} disabled={!invoiceAmount || invoiceGenerating !== null} className="flex-1 py-2.5 rounded-full bg-[#E8B547] text-[#0A0F0D] font-black disabled:opacity-50">{invoiceGenerating ? "Generating..." : "Generate"}</button></div>
          </div>
        </div>
      )}
      {generatedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#EFE9DA] rounded-2xl p-6 max-w-md w-full text-[#0A0F0D]">
            <div className="flex justify-between items-center mb-4"><h3 className="font-black">GST Invoice ✓</h3><button onClick={() => setGeneratedInvoice(null)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">×</button></div>
            <div className="space-y-2 text-sm bg-white rounded-xl p-4 border border-black/10">
              <div className="flex justify-between"><span className="text-black/50">Invoice #</span><span className="font-mono font-bold">{generatedInvoice.invoiceNumber as string}</span></div>
              <div className="flex justify-between"><span className="text-black/50">Business</span><span className="font-semibold">{(generatedInvoice.business as Record<string, unknown>)?.name as string}</span></div>
              <div className="flex justify-between"><span className="text-black/50">Date</span><span>{new Date(generatedInvoice.date as string).toLocaleDateString("en-IN")}</span></div><hr className="border-black/10" />
              <div className="flex justify-between"><span className="text-black/50">Subtotal</span><span>₹{(generatedInvoice.subtotal as number).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-black/50">CGST 2.5%</span><span>₹{(generatedInvoice.gst as Record<string, number>)?.cgst?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-black/50">SGST 2.5%</span><span>₹{(generatedInvoice.gst as Record<string, number>)?.sgst?.toFixed(2)}</span></div><hr className="border-black/10" />
              <div className="flex justify-between font-black text-base"><span>Total</span><span>₹{(generatedInvoice.total as number).toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
