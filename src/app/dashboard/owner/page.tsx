"use client"

import { useState, useEffect, useCallback } from "react"
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
  const [error, setError] = useState("")

  const fetchData = useCallback(async (bid: string) => {
    try {
      const [queueRes, bookingsRes] = await Promise.all([
        fetch(`/api/queue?businessId=${bid}`),
        fetch(`/api/bookings?businessId=${bid}`),
      ])
      if (queueRes.ok) {
        const d = await queueRes.json()
        setQueue(d.entries || [])
      }
      if (bookingsRes.ok) {
        const d = await bookingsRes.json()
        setBookings(d.bookings || [])
      }
    } catch {
      setError("Failed to load data")
    }
  }, [])

  useEffect(() => {
    fetch("/api/business/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setBusinessId(data.id)
          fetchData(data.id)
        }
      })
      .catch(() => setError("Failed to load business settings"))
  }, [fetchData])

  useEffect(() => {
    if (!businessId) return
    const interval = setInterval(() => fetchData(businessId), 10000)
    return () => clearInterval(interval)
  }, [businessId, fetchData])

  const callNext = async (entryId: string) => {
    try {
      const res = await fetch(`/api/queue/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "call" }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to call next customer")
        return
      }
      if (businessId) fetchData(businessId)
    } catch {
      setError("Network error. Please try again.")
    }
  }

  const completeService = async (entryId: string) => {
    try {
      const res = await fetch(`/api/queue/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to complete service")
        return
      }
      if (businessId) fetchData(businessId)
    } catch {
      setError("Network error. Please try again.")
    }
  }

  const confirmBooking = async (bookingId: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "CONFIRMED" }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to confirm booking")
        return
      }
      if (businessId) fetchData(businessId)
    } catch {
      setError("Network error. Please try again.")
    }
  }

  const waiting = queue.filter(e => e.status === "WAITING")
  const serving = queue.filter(e => e.status === "SERVING" || e.status === "CALLED" || e.status === "IN_PROGRESS")
  const todayBookings = bookings.filter(b => b.scheduledAt.startsWith(new Date().toISOString().split("T")[0]))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-bold">×</button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-4xl font-bold text-blue-600">{waiting.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">Waiting</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-amber-600">{serving.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">Serving</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-emerald-600">{todayBookings.length}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">Bookings</p>
          </div>
        </div>

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

        {tab === "queue" && (
          <div className="space-y-3">
            {serving.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Now Serving</h3>
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

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Waiting ({waiting.length})</h3>
              {waiting.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                  <p className="text-gray-400">No one waiting</p>
                </div>
              ) : (
                waiting.map((entry) => (
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

        {tab === "bookings" && (
          <div className="space-y-3">
            {todayBookings.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <p className="text-gray-400">No bookings today</p>
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
