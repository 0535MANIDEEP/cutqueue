"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import Link from "next/link"

interface Booking {
  id: string
  scheduledAt: string
  status: string
  service: { name: string; price: number }
  business: { name: string }
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/bookings")
      .then(r => r.json())
      .then(d => {
        setBookings(d.bookings || [])
        setLoading(false)
      })
  }, [])

  const upcoming = bookings.filter(b => new Date(b.scheduledAt) > new Date() && b.status !== "CANCELLED")
  const past = bookings.filter(b => new Date(b.scheduledAt) < new Date() || b.status === "COMPLETED")

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link href="/book" className="bg-blue-600 text-white rounded-xl p-4 text-center hover:bg-blue-700 transition">
            <p className="text-2xl mb-1">📅</p>
            <p className="text-sm font-medium">Book Now</p>
          </Link>
          <Link href="/queue/join" className="bg-emerald-600 text-white rounded-xl p-4 text-center hover:bg-emerald-700 transition">
            <p className="text-2xl mb-1">⏳</p>
            <p className="text-sm font-medium">Join Queue</p>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-500 mb-3">Upcoming</h2>
                {upcoming.map(b => (
                  <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-4 mb-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{b.service?.name}</p>
                        <p className="text-sm text-gray-500">{b.business?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(b.scheduledAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(b.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-3">Past</h2>
                {past.slice(0, 5).map(b => (
                  <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-4 mb-3 opacity-60">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{b.service?.name}</p>
                        <p className="text-sm text-gray-500">{b.business?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(b.scheduledAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {bookings.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <p className="text-gray-500 mb-4">No bookings yet</p>
                <Link href="/book" className="text-blue-600 font-medium hover:underline">
                  Book your first appointment
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
