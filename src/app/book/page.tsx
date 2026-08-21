"use client"
import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import Heatmap from "@/components/ui/heatmap"
import CalendarView from "@/components/ui/calendar-view"
import { bookingConfirmedTemplate, cancelBookingTemplate, rescheduleBookingTemplate, bookForSomeoneElseTemplate, getWaUrlForTemplate } from "@/lib/whatsapp-templates"
interface Service { id: string; name: string; duration: number; price: number }
interface Staff { id: string; name: string }
interface Slot { time: string; available: boolean }
interface CalendarSlot { date: string; available: boolean; slots: Slot[] }
export default function BookPage() {
  const [shop, setShop] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [heatmap, setHeatmap] = useState<{ day: number; hour: number; count: number }[]>([])
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [booked, setBooked] = useState(false)
  const [bookError, setBookError] = useState("")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get("shop")
    if (slug) {
      fetch(`/api/shops?slug=${slug}`).then(r => r.json()).then(d => {
        if (d.business) {
          setShop(d.business); setServices(d.services || []); setStaff(d.staff || [])
          fetch(`/api/schedule/heatmap?businessId=${d.business.id}&days=30`).then(r => r.json()).then(setHeatmap)
          const now = new Date()
          fetch(`/api/schedule/calendar?businessId=${d.business.id}&month=${now.getMonth()}&year=${now.getFullYear()}`).then(r => r.json()).then(setCalendarSlots)
        }
      })
    }
  }, [])
  const selectedServiceObj = services.find(s => s.id === selectedService)
  const handleBook = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerName || !customerPhone) return
    setLoading(true); setBookError("")
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId: shop.id, serviceId: selectedService, staffId: selectedStaff || undefined, scheduledAt: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(), customerName, customerPhone }) })
      if (res.ok) setBooked(true); else { const data = await res.json(); setBookError(data.error || "Booking failed.") }
    } catch { setBookError("Network error.") }
    setLoading(false)
  }
  if (!shop) return <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 border-4 border-[#E8B547] border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-[#EFE9DA]/50">Loading shop...</p></div></div>
  if (booked) return <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-4"><div className="bg-[#141C18] border border-[#263329] rounded-[20px] p-8 max-w-sm w-full text-center"><div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">✓</div><h2 className="text-2xl font-black text-[#EFE9DA] mb-2">Booked!</h2><p className="text-[#EFE9DA]/60 mb-1">{selectedServiceObj?.name} on {selectedDate} at {selectedTime}</p><p className="text-sm text-[#EFE9DA]/40 mb-4">Confirmation on WhatsApp</p>
  <div className="grid grid-cols-2 gap-2">
    <button onClick={() => window.open(getWaUrlForTemplate(bookingConfirmedTemplate({ shopName: shop.name, serviceName: selectedServiceObj?.name || "", date: selectedDate || "", time: selectedTime || "" }), customerPhone), "_blank")} className="py-3 rounded-full bg-emerald-500 text-white font-bold text-sm">Share WA confirm</button>
    <button onClick={() => window.open(getWaUrlForTemplate(bookForSomeoneElseTemplate({ shopName: shop.name, serviceName: selectedServiceObj?.name || "", date: selectedDate || "", time: selectedTime || "", otherName: customerName, otherPhone: customerPhone }), undefined), "_blank")} className="py-3 rounded-full bg-[#E8B547] text-[#0A0F0D] font-bold text-sm">Book for other</button>
  </div>
  <div className="mt-3 grid grid-cols-2 gap-2">
    <button onClick={() => window.open(getWaUrlForTemplate(cancelBookingTemplate({ shopName: shop.name, serviceName: selectedServiceObj?.name || "", date: selectedDate || "", time: selectedTime || "" }), customerPhone), "_blank")} className="py-2 rounded-full bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]/70 text-xs">❌ Cancel</button>
    <button onClick={() => window.open(getWaUrlForTemplate(rescheduleBookingTemplate({ shopName: shop.name, serviceName: selectedServiceObj?.name || "", date: selectedDate || "", time: selectedTime || "" }), customerPhone), "_blank")} className="py-2 rounded-full bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]/70 text-xs">🔄 Reschedule</button>
  </div>
  <p className="text-xs text-[#EFE9DA]/20 mt-3">All via WhatsApp • FREE manual • PRO auto</p>
  </div></div>
  return (
    <div className="min-h-screen bg-[#0A0F0D]">
      <Header />
      <div className="bg-[#E8B547] text-[#0A0F0D] py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-black tracking-tight">{shop.name}</h1>
          {shop.address && <p className="text-[#0A0F0D]/70 mt-1">{shop.address}</p>}
          <span className="mt-3 inline-flex text-xs font-mono tracking-widest px-3 py-1 rounded-full bg-[#0A0F0D] text-[#E8B547]">Book in 30 seconds • No app needed</span>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          {["Service", "Time", "Details", "Confirm"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-[#E8B547] text-[#0A0F0D]" : "bg-[#1E2528] text-[#EFE9DA]/40 border border-[#263329]"}`}>{step > i + 1 ? "✓" : i + 1}</div>
              <span className={`text-sm hidden sm:block ${step === i + 1 ? "text-[#EFE9DA] font-semibold" : "text-[#EFE9DA]/30"}`}>{label}</span>
              {i < 3 && <div className={`w-8 h-0.5 ${step > i + 1 ? "bg-emerald-500" : "bg-[#1E2528]"}`} />}
            </div>
          ))}
        </div>
        {step === 1 && (
          <div>
            <h2 className="text-xl font-black text-[#EFE9DA] mb-4">Choose a service</h2>
            <div className="grid gap-3">
              {services.map(s => (
                <button key={s.id} onClick={() => { setSelectedService(s.id); setStep(2) }} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition text-left ${selectedService === s.id ? "border-[#E8B547] bg-[#E8B547]/10" : "border-[#263329] bg-[#141C18] hover:border-[#E8B547]/30"}`} aria-label={`${s.name}`}>
                  <div><p className="font-bold text-[#EFE9DA]">{s.name}</p><p className="text-sm text-[#EFE9DA]/40">{s.duration} min</p></div>
                  <span className="text-lg font-black text-[#E8B547]">₹{s.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-black text-[#EFE9DA] mb-4">Pick a date & time</h2>
            <div className="bg-[#141C18] border border-[#263329] rounded-2xl p-4 mb-4"><p className="text-sm font-semibold text-[#EFE9DA] mb-3">Busy hours this week</p><Heatmap data={heatmap} /></div>
            <div className="bg-[#141C18] border border-[#263329] rounded-2xl p-4"><CalendarView slots={calendarSlots} selectedDate={selectedDate} selectedTime={selectedTime} onSelect={(date, time) => { setSelectedDate(date); setSelectedTime(time); setStep(3) }} /></div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-black text-[#EFE9DA] mb-4">Your details</h2>
            <div className="bg-[#141C18] border border-[#263329] rounded-2xl p-4 space-y-4">
              <div><label className="block text-sm font-medium text-[#EFE9DA]/70 mb-1">Your name</label><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter your name" aria-label="Your name" className="w-full bg-[#0A0F0D] border border-[#263329] rounded-xl px-4 py-3 text-[#EFE9DA] placeholder:text-[#EFE9DA]/30 focus:outline-none focus:border-[#E8B547]/50" /></div>
              <div><label className="block text-sm font-medium text-[#EFE9DA]/70 mb-1">WhatsApp number</label><input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+91 98765 43210" aria-label="WhatsApp number" className="w-full bg-[#0A0F0D] border border-[#263329] rounded-xl px-4 py-3 text-[#EFE9DA] placeholder:text-[#EFE9DA]/30 focus:outline-none focus:border-[#E8B547]/50" /></div>
              {staff.length > 0 && <div><label className="block text-sm font-medium text-[#EFE9DA]/70 mb-1">Preferred staff</label><div className="grid grid-cols-2 gap-2">{staff.map(s => <button key={s.id} onClick={() => setSelectedStaff(selectedStaff === s.id ? null : s.id)} className={`p-3 rounded-xl border text-sm font-semibold transition ${selectedStaff === s.id ? "border-[#E8B547] bg-[#E8B547]/15 text-[#EFE9DA]" : "border-[#263329] bg-[#0A0F0D] text-[#EFE9DA]/60"}`}>{s.name}</button>)}</div></div>}
            </div>
            <Button variant="primary" className="w-full mt-4 rounded-full" size="lg" onClick={() => setStep(4)} disabled={!customerName || !customerPhone}>Continue →</Button>
          </div>
        )}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-black text-[#EFE9DA] mb-4">Confirm booking</h2>
            <div className="bg-[#141C18] border border-[#263329] rounded-2xl p-6 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-[#EFE9DA]/40">Service</span><span className="font-semibold text-[#EFE9DA]">{selectedServiceObj?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#EFE9DA]/40">Date</span><span className="font-semibold text-[#EFE9DA]">{selectedDate}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#EFE9DA]/40">Time</span><span className="font-semibold text-[#EFE9DA]">{selectedTime}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#EFE9DA]/40">Duration</span><span className="font-semibold text-[#EFE9DA]">{selectedServiceObj?.duration} min</span></div>
              <div className="flex justify-between text-sm border-t border-[#263329] pt-3"><span className="text-[#EFE9DA]/40">Name</span><span className="font-semibold text-[#EFE9DA]">{customerName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#EFE9DA]/40">Phone</span><span className="font-semibold text-[#EFE9DA]">{customerPhone}</span></div>
              <div className="flex justify-between border-t border-[#263329] pt-3"><span className="text-lg font-black text-[#EFE9DA]">Total</span><span className="text-lg font-black text-[#E8B547]">₹{selectedServiceObj?.price}</span></div>
            </div>
            <div className="flex gap-3 mt-4"><Button variant="outline" className="flex-1 rounded-full border-[#263329] text-[#EFE9DA]" onClick={() => setStep(3)}>Back</Button><Button variant="primary" className="flex-1 rounded-full" onClick={handleBook} disabled={loading} isLoading={loading}>Confirm Booking</Button></div>
            {bookError && <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center">{bookError}</div>}
          </div>
        )}
        {step > 1 && step < 4 && <button onClick={() => setStep(step - 1)} className="mt-4 text-[#EFE9DA]/50 hover:text-[#EFE9DA] text-sm font-medium">← Back</button>}
      </div>
    </div>
  )
}
