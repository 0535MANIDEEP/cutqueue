"use client"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { callNextTemplate, getWaUrlForTemplate, joinTemplate, checkPositionTemplate, leaveQueueTemplate, runningLateTemplate, arrivedTemplate, cancelBookingTemplate } from "@/lib/whatsapp-templates"
interface QueueEntry { id: string; ticketNumber: number; status: string; serviceType: string; joinedAt: string; position: number | null }
interface QueueData { queue: { id: string; isActive: boolean } | null; entries: QueueEntry[]; waitingCount: number; estimatedWait: number; avgServiceTime: number; hours?: { open: boolean; reason?: string | null; nextOpenAt?: string | null } }
function QueueStatus() {
  const searchParams = useSearchParams()
  const businessId = searchParams.get("businessId")
  const ticket = searchParams.get("ticket")
  const [data, setData] = useState<QueueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const fetchData = useCallback(async () => {
    if (!businessId) return
    try { const res = await fetch(`/api/queue/public?businessId=${businessId}`); if (!res.ok) { setError("Failed to load queue status"); return } const d = await res.json(); setData(d); setLoading(false) } catch { setError("Network error"); setLoading(false) }
  }, [businessId])
  useEffect(() => { fetchData(); const interval = setInterval(fetchData, 5000); return () => clearInterval(interval) }, [fetchData])
  if (!businessId) return <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4"><div className="bg-[#141C18] border border-[#263329] rounded-2xl p-8 text-center max-w-sm w-full"><p className="text-[#EFE9DA]/60">Invalid queue link</p></div></div>
  if (loading) return <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4"><div className="bg-[#141C18] border border-[#263329] rounded-2xl p-8 text-center max-w-sm w-full"><div className="animate-spin h-8 w-8 border-4 border-[#E8B547] border-t-transparent rounded-full mx-auto mb-4" /><p className="text-[#EFE9DA]/60">Loading queue...</p></div></div>
  if (error) return <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4"><div className="bg-[#141C18] border border-[#263329] rounded-2xl p-8 text-center max-w-sm w-full"><p className="text-red-400">{error}</p><button onClick={fetchData} className="mt-4 text-[#E8B547] text-sm font-medium">Retry</button></div></div>
  if (!data?.queue) return <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4"><div className="bg-[#141C18] border border-[#263329] rounded-2xl p-8 text-center max-w-sm w-full"><p className="text-[#EFE9DA]/60">Queue not found</p></div></div>
  if (!data.queue.isActive) return <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4"><div className="bg-[#141C18] border border-[#263329] rounded-2xl p-8 text-center max-w-sm w-full"><p className="text-[#EFE9DA] font-semibold">Queue is closed</p><p className="text-[#EFE9DA]/40 text-sm mt-1">Please check back later</p></div></div>
  if (data.hours && !data.hours.open) return <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4"><div className="bg-[#141C18] border border-[#E8B547]/30 rounded-2xl p-8 text-center max-w-sm w-full"><p className="text-[#E8B547] font-bold">⏸️ {data.hours.reason}</p><p className="text-[#EFE9DA]/60 text-sm mt-2">Next open: {data.hours.nextOpenAt || "soon"} • IST</p><p className="text-[#EFE9DA]/30 text-xs mt-2">Lunch/closing time — queue paused, your position held</p></div></div>
  const myEntry = ticket ? data.entries.find(e => e.ticketNumber === Number(ticket)) : null
  if (!myEntry) {
    if (ticket) return <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4"><div className="bg-[#141C18] border border-[#263329] rounded-2xl p-8 text-center max-w-sm w-full"><p className="text-[#EFE9DA] font-semibold">Ticket #{ticket} not found</p><p className="text-[#EFE9DA]/40 text-sm mt-1">Ask the shop to add you to the queue</p></div></div>
    const waiting = data.entries.filter(e => e.status === "WAITING")
    return (
      <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4">
        <div className="bg-[#141C18] border border-[#263329] rounded-[20px] p-6 max-w-sm w-full">
          <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[11px] font-mono tracking-widest text-[#EFE9DA]/50 uppercase">Live queue</span></div>
          <h1 className="text-xl font-black text-[#EFE9DA]">Live Queue</h1>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-2xl bg-[#0A0F0D] border border-[#263329] p-4 text-center"><p className="text-3xl font-black text-[#E8B547]">{data.waitingCount}</p><p className="text-xs text-[#EFE9DA]/40 mt-1">People Waiting</p></div>
            <div className="rounded-2xl bg-[#0A0F0D] border border-[#263329] p-4 text-center"><p className="text-3xl font-black text-emerald-400">{data.estimatedWait}m</p><p className="text-xs text-[#EFE9DA]/40 mt-1">Est. Wait</p></div>
          </div>
          {waiting.length > 0 && (
            <div className="mt-5">
              <div className="relative h-[84px]">
                <div className="absolute top-[34px] left-2 right-2 h-[2px] bg-[#1E2528] rounded-full" />
                <div className="absolute inset-0 flex items-end justify-between gap-1">
                  {waiting.slice(0,5).map((e, i) => (
                    <div key={e.id} className="flex flex-col items-center gap-1">
                      <div className="w-[52px] h-[52px] rounded-xl bg-[#0A0F0D] border border-[#263329] flex flex-col items-center justify-center" style={{ opacity: 1 - i*0.12 }}>
                        <span className="text-[10px] font-mono text-[#EFE9DA]/40">#{e.ticketNumber}</span>
                        <span className="text-xs text-[#EFE9DA]/70">{e.serviceType.slice(0,6)}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#EFE9DA]/30">{i===0?'NEXT':`${i*3}m`}</span>
                    </div>
                  ))}
                </div>
              </div>
              {waiting.length>5 && <p className="text-center text-[#EFE9DA]/30 text-xs mt-2">+{waiting.length-5} more in line</p>}
            </div>
          )}
          <p className="text-[#EFE9DA]/30 text-xs mt-5 text-center">Ask the shop for your ticket • Auto-updates every 5s</p>
        </div>
      </div>
    )
  }
  const myPosition = myEntry.position ?? (myEntry.status === "WAITING" ? data.entries.filter(e => e.status === "WAITING" && e.ticketNumber < myEntry.ticketNumber).length + 1 : 0)
  const waiting = data.entries.filter(e => e.status === "WAITING").slice(0,6)
  const youIndex = waiting.findIndex(e => e.id === myEntry.id)
  const statusConfig: Record<string, { label: string; dot: string }> = {
    WAITING: { label: `Position ${myPosition} • ${myPosition * data.avgServiceTime} min`, dot: 'bg-[#E8B547]' },
    CALLED: { label: 'Your turn! Proceed to counter', dot: 'bg-emerald-500 animate-pulse' },
    IN_PROGRESS: { label: 'Being served', dot: 'bg-emerald-500' },
    COMPLETED: { label: 'Completed — thank you!', dot: 'bg-white/20' },
    CANCELLED: { label: 'Cancelled', dot: 'bg-red-500' },
  }
  const status = statusConfig[myEntry.status] || statusConfig.WAITING
  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-4">
      <div className="bg-[#141C18] border border-[#263329] rounded-[20px] p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono tracking-widest text-[#EFE9DA]/40 uppercase">Your ticket</span>
          <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]/70"><span className={`w-2 h-2 rounded-full ${status.dot}`} />{myEntry.status}</span>
        </div>
        <div className="text-center">
          <div className={`mx-auto w-[140px] h-[112px] rounded-[20px] border flex flex-col items-center justify-center ${myEntry.status==='CALLED'?'bg-[#E8B547] border-[#E8B547] shadow-[0_10px_30px_rgba(232,181,71,0.3)] animate-pulse':'bg-[#0A0F0D] border-[#263329]'}`}>
            <span className={`text-xs font-mono tracking-widest ${myEntry.status==='CALLED'?'text-[#0A0F0D]/60':'text-[#EFE9DA]/30'}`}>{myEntry.status==='WAITING'?'POSITION':'TICKET'}</span>
            <span className={`text-5xl font-black ${myEntry.status==='CALLED'?'text-[#0A0F0D]':'text-[#EFE9DA]'}`}>{myEntry.status==='WAITING'? myPosition : `#${myEntry.ticketNumber}`}</span>
            <span className={`text-xs font-mono ${myEntry.status==='CALLED'?'text-[#0A0F0D]/60':'text-[#EFE9DA]/30'}`}>{myEntry.status==='WAITING'?`Ticket #${myEntry.ticketNumber} • ${myEntry.serviceType}`: myEntry.serviceType}</span>
          </div>
          <div className={`mt-4 rounded-full px-4 py-2 border text-sm font-semibold inline-flex items-center gap-2 ${myEntry.status==='CALLED'?'bg-[#E8B547] border-[#E8B547] text-[#0A0F0D]':'bg-[#0A0F0D] border-[#263329] text-[#EFE9DA]'}`}>{status.label}</div>
        </div>
        {myEntry.status === "WAITING" && (
          <>
            <div className="relative mt-6 h-[96px]">
              <div className="absolute top-[40px] left-2 right-2 h-[2px] bg-[#1E2528] rounded-full" />
              <div className="absolute top-[40px] left-2 h-[2px] bg-[#E8B547] rounded-full transition-all duration-700" style={{ width: youIndex>=0? `${((youIndex+1)/waiting.length)*100}%` : '12%', maxWidth: 'calc(100% - 16px)' }} />
              <div className="absolute inset-0 flex items-end justify-between gap-1">
                {waiting.map((e) => {
                  const isYou = e.id===myEntry.id
                  return (
                    <div key={e.id} className={`flex flex-col items-center gap-1 transition-all duration-500 ${isYou?'scale-[1.08] -translate-y-1':''}`}>
                      <div className={`w-[48px] h-[52px] rounded-xl border flex flex-col items-center justify-center ${isYou?'bg-[#E8B547] border-[#E8B547] shadow-[0_6px_18px_rgba(232,181,71,0.35)]':'bg-[#0A0F0D] border-[#263329]'}`}>
                        <span className={`text-[9px] font-mono ${isYou?'text-[#0A0F0D]/60':'text-[#EFE9DA]/30'}`}>#{e.ticketNumber}</span>
                        <span className={`text-[11px] font-bold ${isYou?'text-[#0A0F0D]':'text-[#EFE9DA]/60'}`}>{isYou?'YOU':'P'}</span>
                      </div>
                      <span className={`text-[10px] font-mono ${isYou?'text-[#E8B547] font-bold':'text-[#EFE9DA]/25'}`}>{isYou?`#${myPosition}`:''}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-[#0A0F0D] border border-[#1E2528] overflow-hidden"><div className="h-full bg-[#E8B547] transition-all duration-700" style={{ width: `${Math.max(8, (1 - (myPosition-1)/Math.max(6, data.waitingCount))*100)}%` }} /></div>
            <p className="text-center text-[11px] font-mono text-[#EFE9DA]/30 mt-1">{myPosition} of {data.waitingCount} • {myPosition * data.avgServiceTime} min remaining</p>
          </>
        )}
        {myEntry.status === "CALLED" && <div className="mt-5 rounded-xl bg-[#E8B547] text-[#0A0F0D] p-4 text-center font-bold">Please proceed to the counter now →</div>}
        {myEntry.status === "IN_PROGRESS" && <div className="mt-5 rounded-xl bg-emerald-500 text-white p-4 text-center font-bold">You’re being served — enjoy!</div>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => { const url = `${window.location.origin}/queue/status?businessId=${businessId}&ticket=${myEntry.ticketNumber}`; const msg = myEntry.status === "CALLED" ? callNextTemplate({ shopName: "Your shop", ticket: myEntry.ticketNumber, serviceType: myEntry.serviceType }) : joinTemplate({ shopName: "Your shop", ticket: myEntry.ticketNumber, position: myPosition, statusUrl: url }); window.open(getWaUrlForTemplate(msg), "_blank") }} className="py-2.5 rounded-full bg-emerald-500 text-white font-bold text-sm">Share on WhatsApp</button>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="py-2.5 rounded-full bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA] font-semibold text-sm">Copy link</button>
        </div>
        {/* Customer → Business quick actions */}
        <div className="mt-4 rounded-2xl bg-[#0A0F0D] border border-[#263329] p-3">
          <p className="text-[11px] font-mono tracking-widest text-[#EFE9DA]/30 uppercase mb-2">Customer actions — tap to WhatsApp business</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => window.open(getWaUrlForTemplate(checkPositionTemplate({ shopName: "Shop", ticket: myEntry.ticketNumber, position: myPosition })), "_blank")} className="py-2 rounded-xl bg-[#141C18] border border-[#263329] text-[#EFE9DA] text-xs font-semibold">📍 Check position</button>
            <button onClick={() => window.open(getWaUrlForTemplate(arrivedTemplate({ shopName: "Shop", ticket: myEntry.ticketNumber })), "_blank")} className="py-2 rounded-xl bg-[#141C18] border border-[#263329] text-emerald-400 text-xs font-bold">📍 I&apos;ve arrived</button>
            <button onClick={() => window.open(getWaUrlForTemplate(runningLateTemplate({ shopName: "Shop", ticket: myEntry.ticketNumber, minutes: 5 })), "_blank")} className="py-2 rounded-xl bg-[#141C18] border border-[#263329] text-amber-400 text-xs font-semibold">⏰ Running 5m late</button>
            <button onClick={async () => { if (!confirm("Leave queue?")) return; await fetch("/api/queue/leave", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId, ticketNumber: myEntry.ticketNumber }) }); window.open(getWaUrlForTemplate(leaveQueueTemplate({ shopName: "Shop", ticket: myEntry.ticketNumber })), "_blank"); window.location.reload() }} className="py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">🚪 Leave queue</button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={() => window.open(getWaUrlForTemplate(cancelBookingTemplate({ shopName: "Shop", serviceName: myEntry.serviceType, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() })), "_blank")} className="py-2 rounded-xl bg-[#141C18] border border-[#263329] text-[#EFE9DA]/70 text-xs">❌ Cancel booking</button>
            <a href={`/book?shop=${businessId}`} className="py-2 rounded-xl bg-[#E8B547] text-[#0A0F0D] text-xs font-black text-center">👥 Book for someone</a>
          </div>
        </div>
        <p className="text-center text-[#EFE9DA]/20 text-xs mt-3">FREE: manual share • PRO: auto-send on call → <a href="/dashboard/owner/subscription" className="text-[#E8B547]">Upgrade</a></p>
        <p className="text-center text-[#EFE9DA]/20 text-xs mt-1">Updates automatically every 5 seconds • Keep this page open</p>
      </div>
    </div>
  )
}
export default function QueueStatusPage(){ return <Suspense fallback={<div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#E8B547] border-t-transparent rounded-full" /></div>}><QueueStatus /></Suspense> }
