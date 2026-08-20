"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"

interface AnalyticsData {
  overview: {
    totalBookings: number
    bookingsLast30Days: number
    completedBookings: number
    cancelledBookings: number
    completionRate: number
    cancellationRate: number
    totalCustomers: number
    newCustomersThisMonth: number
    averageRating: number
    totalReviews: number
  }
  revenue: {
    thisMonth: number
    lastMonth: number
    monthlyDelta: number
  }
  bookings: {
    thisMonth: number
    lastMonth: number
    monthlyDelta: number
    byDayOfWeek: { day: string; count: number }[]
    trend: Record<string, number>
  }
  topServices: { serviceId: string; name: string; price: number; _count: { id: number } }[]
  recentBookings: {
    id: string
    scheduledAt: string
    status: string
    createdAt: string
    service: { name: string; price: number }
    customer: { name: string | null; email: string }
  }[]
  queue: {
    currentNumber: number
    estimatedWait: number
    activeEntries: number
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)
}

function DeltaBadge({ value, prefix }: { value: number; prefix?: string }) {
  const isPositive = value >= 0
  return (
    <span className={`text-sm font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
      {isPositive ? "+" : ""}{prefix}{value}%
    </span>
  )
}

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Failed to load analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{data.overview.totalBookings}</p>
            <DeltaBadge value={data.bookings.monthlyDelta} />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Completion Rate</p>
            <p className="text-3xl font-bold text-gray-900">{data.overview.completionRate}%</p>
            <p className="text-sm text-gray-500">{data.overview.completedBookings} completed</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900">{data.overview.totalCustomers}</p>
            <p className="text-sm text-emerald-600">+{data.overview.newCustomersThisMonth} this month</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Average Rating</p>
            <p className="text-3xl font-bold text-gray-900">{data.overview.averageRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">{data.overview.totalReviews} reviews</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Queue Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Current Number</span>
                <span className="font-semibold">#{data.queue.currentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active in Queue</span>
                <span className="font-semibold">{data.queue.activeEntries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Wait Time</span>
                <span className="font-semibold">{data.queue.estimatedWait} min</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Top Services</h3>
            <div className="space-y-3">
              {data.topServices.length === 0 ? (
                <p className="text-gray-500 text-sm">No completed bookings yet</p>
              ) : (
                data.topServices.map((s, i) => (
                  <div key={s.serviceId} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400">{i + 1}.</span>
                      <span className="text-sm">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{s._count.id} bookings</span>
                      <span className="text-xs text-gray-400 ml-2">{formatCurrency(s.price)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Bookings by Day</h3>
            <div className="space-y-2">
              {data.bookings.byDayOfWeek.map((d) => (
                <div key={d.day} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-8">{d.day}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4">
                    <div
                      className="bg-blue-500 rounded-full h-4 transition-all"
                      style={{
                        width: `${data.bookings.byDayOfWeek.length > 0
                          ? (d.count / Math.max(...data.bookings.byDayOfWeek.map((x) => x.count))) * 100
                          : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold">Recent Bookings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Service</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-6 py-4 text-sm">{b.customer.name || b.customer.email}</td>
                    <td className="px-6 py-4 text-sm">{b.service.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(b.scheduledAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        b.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                        b.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                        b.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No bookings yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
