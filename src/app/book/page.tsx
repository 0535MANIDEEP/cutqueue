"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import Heatmap from "@/components/ui/heatmap"
import CalendarView from "@/components/ui/calendar-view"

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get("shop")
    if (slug) {
      fetch(`/api/shops?slug=${slug}`).then(r => r.json()).then(d => {
        if (d.business) {
          setShop(d.business)
          setServices(d.services || [])
          setStaff(d.staff || [])
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
    setLoading(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: shop.id,
          serviceId: selectedService,
          staffId: selectedStaff,
          scheduledAt: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
          customerName,
          customerPhone,
        }),
      })
      if (res.ok) setBooked(true)
    } catch {}
    setLoading(false)
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading shop...</p>
        </div>
      </div>
    )
  }

  if (booked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booked!</h2>
          <p className="text-gray-600 mb-4">{selectedServiceObj?.name} on {selectedDate} at {selectedTime}</p>
          <p className="text-sm text-gray-500">We&apos;ll send you a confirmation on WhatsApp</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
          {shop.address && <p className="text-blue-100">{shop.address}</p>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Service", "Time", "Details", "Confirm"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                step > i + 1 ? "bg-emerald-500 text-white" :
                step === i + 1 ? "bg-blue-600 text-white" :
                "bg-gray-200 text-gray-500"
              }`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step === i + 1 ? "text-blue-600 font-medium" : "text-gray-400"}`}>{label}</span>
              {i < 3 && <div className={`w-8 h-0.5 ${step > i + 1 ? "bg-emerald-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Pick Service */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Choose a service</h2>
            <div className="grid gap-3">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s.id); setStep(2) }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition text-left ${
                    selectedService === s.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.duration} min</p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">₹{s.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pick Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pick a date & time</h2>

            {/* Heatmap */}
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">Busy hours this week</p>
              <Heatmap data={heatmap} />
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <CalendarView
                slots={calendarSlots}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelect={(date, time) => {
                  setSelectedDate(date)
                  setSelectedTime(time)
                  setStep(3)
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your details</h2>
            <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg"
                />
              </div>

              {staff.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred staff (optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {staff.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStaff(selectedStaff === s.id ? null : s.id)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition ${
                          selectedStaff === s.id ? "border-blue-500 bg-blue-50" : "border-gray-100"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(4)}
              disabled={!customerName || !customerPhone}
              className="w-full mt-4 bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm booking</h2>
            <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">{selectedServiceObj?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{selectedServiceObj?.duration} min</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-4">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{customerPhone}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-4">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-blue-600">₹{selectedServiceObj?.price}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                onClick={handleBook}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}

        {/* Back button */}
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
