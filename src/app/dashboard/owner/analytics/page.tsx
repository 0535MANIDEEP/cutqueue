"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"

interface AnalyticsData {
  revenue: {
    today: number
    thisMonth: number
    lastMonth: number
    trend: { date: string; revenue: number; bookings: number }[]
  }
  bookings: {
    today: number
    completed: number
    noShows: number
    cancelled: number
    noShowRate: number
  }
  queue: {
    avgWaitTime: number
    servedToday: number
  }
  customers: {
    total: number
    newThisMonth: number
  }
  topServices: { name: string; count: number; revenue: number }[]
  topStaff: { name: string; bookings: number; revenue: number }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
          Failed to load analytics
        </div>
      </div>
    )
  }

  const revenueChange = data.revenue.lastMonth > 0
    ? Math.round(((data.revenue.thisMonth - data.revenue.lastMonth) / data.revenue.lastMonth) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

        {/* Revenue Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Today&apos;s Revenue</p>
            <p className="text-2xl font-bold text-gray-900">₹{data.revenue.today.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">This Month</p>
            <p className="text-2xl font-bold text-gray-900">₹{data.revenue.thisMonth.toLocaleString("en-IN")}</p>
            {revenueChange !== 0 && (
              <p className={`text-xs mt-1 ${revenueChange > 0 ? "text-emerald-600" : "text-red-600"}`}>
                {revenueChange > 0 ? "+" : ""}{revenueChange}% vs last month
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Today&apos;s Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{data.bookings.today}</p>
            <p className="text-xs text-gray-400 mt-1">
              {data.bookings.completed} done · {data.bookings.noShows} no-show
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">No-Show Rate</p>
            <p className={`text-2xl font-bold ${data.bookings.noShowRate > 10 ? "text-red-600" : "text-emerald-600"}`}>
              {data.bookings.noShowRate}%
            </p>
            <p className="text-xs text-gray-400 mt-1">This month</p>
          </div>
        </div>

        {/* Queue & Customers */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Avg Wait Time</p>
            <p className="text-2xl font-bold text-gray-900">{data.queue.avgWaitTime}m</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Served Today</p>
            <p className="text-2xl font-bold text-gray-900">{data.queue.servedToday}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{data.customers.total}</p>
            <p className="text-xs text-emerald-600 mt-1">+{data.customers.newThisMonth} new this month</p>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Revenue (Last 7 Days)</h2>
          <div className="flex items-end gap-2 h-40">
            {data.revenue.trend.map((day) => {
              const maxRevenue = Math.max(...data.revenue.trend.map((d) => d.revenue), 1)
              const height = (day.revenue / maxRevenue) * 100
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">₹{day.revenue}</span>
                  <div
                    className="w-full bg-blue-500 rounded-t-md min-h-[4px] transition-all"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-xs text-gray-400">
                    {new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Services & Staff */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Top Services</h2>
            {data.topServices.length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet</p>
            ) : (
              <div className="space-y-3">
                {data.topServices.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.count} bookings</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">₹{s.revenue.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Staff Performance</h2>
            {data.topStaff.length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet</p>
            ) : (
              <div className="space-y-3">
                {data.topStaff.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.bookings} bookings</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">₹{s.revenue.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
