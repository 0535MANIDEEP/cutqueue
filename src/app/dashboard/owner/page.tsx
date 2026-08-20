"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"

interface QueueEntry {
  id: string
  position: number
  status: string
  customer: { name: string; phone: string }
  service: { name: string; duration: number }
  estimatedWait: number
}

interface Booking {
  id: string
  scheduledAt: string
  status: string
  customer: { name: string; phone: string }
  service: { name: string }
}

export default function OwnerDashboard() {
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [tab, setTab] = useState<"queue" | "bookings">("queue")

  useEffect(() => {
    fetch("/api/business/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setBusinessId(data.id)
          fetchData(data.id)
        }
      })
      .catch(() => {})
  }, [])

  // Auto-refresh every 5 seconds for real-time queue updates
  useEffect(() => {
    if (!businessId) return
    const interval = setInterval(() => fetchData(businessId), 5000)
    return () => clearInterval(interval)
  }, [businessId])

  const fetchData = (bid: string) => {
    fetch(`/api/queue?businessId=${bid}`).then(r => r.json()).then(d => setQueue(d.entries || []))
    fetch(`/api/bookings?businessId=${bid}`).then(r => r.json()).then(d => setBookings(d.bookings || []))
  }

  const callNext = async (entryId: string) => {
    await fetch(`/api/queue/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SERVING" }),
    })
    if (businessId) fetchData(businessId)
  }

  const completeService = async (entryId: string) => {
    await fetch(`/api/queue/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    })
    if (businessId) fetchData(businessId)
  }

  const confirmBooking = async (bookingId: string) => {
    await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, status: "CONFIRMED" }),
    })
    if (businessId) fetchData(businessId)
  }

  const waiting = queue.filter(e => e.status === "WAITING")
  const serving = queue.filter(e => e.status === "SERVING")
  const todayBookings = bookings.filter(b => b.scheduledAt.startsWith(new Date().toISOString().split("T")[0]))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-blue-600">{waiting.length}</p>
            <p className="text-sm text-gray-500">Waiting</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-amber-600">{serving.length}</p>
            <p className="text-sm text-gray-500">Serving</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-emerald-600">{todayBookings.length}</p>
            <p className="text-sm text-gray-500">Bookings</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setTab("queue")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              tab === "queue" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            }`}
          >
            Queue ({waiting.length + serving.length})
          </button>
          <button
            onClick={() => setTab("bookings")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              tab === "bookings" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            }`}
          >
            Bookings ({todayBookings.length})
          </button>
        </div>

        {/* Queue Tab */}
        {tab === "queue" && (
          <div className="space-y-3">
            {/* Currently Serving */}
            {serving.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Now Serving</h3>
                {serving.map(entry => (
                  <div key={entry.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{entry.customer?.name}</p>
                        <p className="text-sm text-gray-600">{entry.service?.name} • {entry.service?.duration} min</p>
                      </div>
                      <button
                        onClick={() => completeService(entry.id)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Waiting */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Waiting ({waiting.length})</h3>
              {waiting.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                  <p className="text-gray-500">No one waiting</p>
                </div>
              ) : (
                waiting.map((entry, i) => (
                  <div key={entry.id} className="bg-white border border-gray-100 rounded-xl p-4 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {entry.position}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.customer?.name}</p>
                        <p className="text-sm text-gray-500">{entry.service?.name} • ~{entry.estimatedWait} min</p>
                      </div>
                    </div>
                    <button
                      onClick={() => callNext(entry.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Call Next
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {tab === "bookings" && (
          <div className="space-y-3">
            {todayBookings.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <p className="text-gray-500">No bookings today</p>
              </div>
            ) : (
              todayBookings.map(booking => (
                <div key={booking.id} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{booking.customer?.name}</p>
                      <p className="text-sm text-gray-500">
                        {booking.service?.name} • {new Date(booking.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {booking.status === "PENDING" ? (
                      <button
                        onClick={() => confirmBooking(booking.id)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
                      >
                        Confirm
                      </button>
                    ) : (
                      <span className="text-sm text-emerald-600 font-medium">Confirmed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
