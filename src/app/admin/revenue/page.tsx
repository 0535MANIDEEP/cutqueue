'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/trial'

interface RevenueData {
  stats: {
    totalBusinesses: number
    activeBusinesses: number
    totalBookings: number
    totalUsers: number
  }
  pricing: Record<string, {
    name: string
    price: number
    description: string
  }>
  projection: Record<string, {
    businesses: number
    revenue: number
    cost: number
  }>
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/trial')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#EFE9DA]/50">Loading...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#EFE9DA]">Revenue & Growth</h1>
        <p className="text-[#EFE9DA]/50 mt-1">JIO-style free trial strategy</p>
      </div>

      {/* Current Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-[#E8B547]">{data.stats.totalBusinesses}</div>
            <div className="text-sm text-[#EFE9DA]/60">Total Businesses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-green-500">{data.stats.activeBusinesses}</div>
            <div className="text-sm text-[#EFE9DA]/60">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-[#EFE9DA]">{data.stats.totalBookings}</div>
            <div className="text-sm text-[#EFE9DA]/60">Total Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-[#EFE9DA]">{data.stats.totalUsers}</div>
            <div className="text-sm text-[#EFE9DA]/60">Total Users</div>
          </CardContent>
        </Card>
      </div>

      {/* JIO Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>JIO-Style Free Trial Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-[#1E2E29] border border-[#2A3F3A]">
              <h3 className="font-semibold text-[#E8B547] mb-2">Phase 1: Acquisition (Months 1-3)</h3>
              <ul className="text-sm text-[#EFE9DA]/60 space-y-1">
                <li>• 90-day free trial for all businesses</li>
                <li>• Zero SMS/email costs</li>
                <li>• In-app notifications only</li>
                <li>• Goal: 400+ businesses</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-[#1E2E29] border border-[#2A3F3A]">
              <h3 className="font-semibold text-[#E8B547] mb-2">Phase 2: Conversion (Months 4-6)</h3>
              <ul className="text-sm text-[#EFE9DA]/60 space-y-1">
                <li>• 25% conversion to paid plans</li>
                <li>• SMS/email notifications enabled</li>
                <li>• Starter tier at $15/month</li>
                <li>• Goal: $2,250-9,000 MRR</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-[#1E2E29] border border-[#2A3F3A]">
              <h3 className="font-semibold text-[#E8B547] mb-2">Phase 3: Scale (Months 7-12)</h3>
              <ul className="text-sm text-[#EFE9DA]/60 space-y-1">
                <li>• 40% conversion rate</li>
                <li>• Pro tier at $30/month</li>
                <li>• Enterprise deals at $75/month</li>
                <li>• Goal: $36K MRR</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(data.pricing).map(([key, tier]) => (
              <div
                key={key}
                className={`p-4 rounded-lg border ${
                  key === 'FREE'
                    ? 'border-[#2A3F3A] bg-[#1E2E29]'
                    : 'border-[#E8B547]/30 bg-[#E8B547]/5'
                }`}
              >
                <div className="text-sm text-[#EFE9DA]/40 mb-1">{tier.name}</div>
                <div className="text-2xl font-bold text-[#EFE9DA] mb-2">
                  {tier.price === 0 ? 'Free' : formatCurrency(tier.price)}
                  {tier.price > 0 && <span className="text-sm font-normal text-[#EFE9DA]/50">/mo</span>}
                </div>
                <p className="text-xs text-[#EFE9DA]/50">{tier.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Projection */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Projection (Year 1)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A3F3A]">
                  <th className="text-left py-3 text-[#EFE9DA]/60">Month</th>
                  <th className="text-left py-3 text-[#EFE9DA]/60">Businesses</th>
                  <th className="text-left py-3 text-[#EFE9DA]/60">Revenue</th>
                  <th className="text-left py-3 text-[#EFE9DA]/60">Cost</th>
                  <th className="text-left py-3 text-[#EFE9DA]/60">Profit</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.projection).map(([month, proj]) => (
                  <tr key={month} className="border-b border-[#2A3F3A]/50">
                    <td className="py-3 text-[#EFE9DA] capitalize">{month.replace('month', 'Month ')}</td>
                    <td className="py-3 text-[#EFE9DA]">{proj.businesses}</td>
                    <td className="py-3 text-green-400">{formatCurrency(proj.revenue)}</td>
                    <td className="py-3 text-red-400">{formatCurrency(proj.cost)}</td>
                    <td className="py-3 text-[#EFE9DA]">{formatCurrency(proj.revenue - proj.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
