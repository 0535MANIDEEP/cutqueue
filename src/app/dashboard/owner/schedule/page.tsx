"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import Heatmap from "@/components/ui/heatmap"
import CalendarView from "@/components/ui/calendar-view"

interface Booking {
  id: string
  scheduledAt: string
  status: string
  service: { name: string }
  customer: { name: string; phone: string }
}

export default function OwnerSchedulePage() {
  const [heatmap, setHeatmap] = useState<{ day: number; hour: number; count: number }[]>([])
  const [calendarSlots, setCalendarSlots] = useState<any[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [view, setView] = useState<"heatmap" | "calendar">("heatmap")

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then(session => {
      const bid = session?.user?.businessId
      if (bid) {
        setBusinessId(bid)
        fetch(`/api/schedule/heatmap?businessId=${bid}&days=30`).then(r => r.json()).then(setHeatmap)
        const now = new Date()
        fetch(`/api/schedule/calendar?businessId=${bid}&month=${now.getMonth()}&year=${now.getFullYear()}`).then(r => r.json()).then(setCalendarSlots)
      }
    })
  }, [])

  useEffect(() => {
    if (businessId) {
      fetch(`/api/bookings?businessId=${businessId}`).then(r => r.json()).then(d => setBookings(d.bookings || []))
    }
  }, [businessId])

  const filteredBookings = bookings.filter(b => {
    if (!selectedDate) return true
    return b.scheduledAt.startsWith(selectedDate)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("heatmap")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                view === "heatmap" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                view === "calendar" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {view === "heatmap" ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Busy hours (last 30 days)</h2>
            <Heatmap data={heatmap} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pick a date</h2>
              <CalendarView
                slots={calendarSlots}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelect={(date, time) => {
                  setSelectedDate(date)
                  setSelectedTime(time)
                }}
              />
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Bookings for {selectedDate || "all dates"}
              </h2>
              {filteredBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings found</p>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{b.customer?.name}</p>
                        <p className="text-sm text-gray-500">{b.service?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(b.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          b.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" :
                          b.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-2xl font-bold text-gray-900">
              {bookings.filter(b => b.scheduledAt.startsWith(new Date().toISOString().split("T")[0])).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">This Week</p>
            <p className="text-2xl font-bold text-gray-900">
              {bookings.filter(b => {
                const d = new Date(b.scheduledAt)
                const now = new Date()
                const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
                return d >= weekStart
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === "PENDING").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-2xl font-bold text-emerald-600">
              {bookings.filter(b => b.status === "CONFIRMED").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
