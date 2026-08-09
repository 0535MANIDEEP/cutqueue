"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Stats {
  totalUsers: number
  totalBusinesses: number
  totalBookings: number
  totalQueueEntries: number
}

interface UserByRole {
  role: string
  count: number
}

interface BusinessByPlan {
  plan: string
  count: number
}

interface RecentUser {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
}

interface RecentBusiness {
  id: string
  name: string
  plan: string
  createdAt: string
  template: { name: string; icon: string } | null
}

interface DashboardData {
  stats: Stats
  usersByRole: UserByRole[]
  businessesByPlan: BusinessByPlan[]
  recentUsers: RecentUser[]
  recentBusinesses: RecentBusiness[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        setData(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#EFE9DA]/50">Loading...</div>
      </div>
    )
  }

  if (!data) return null

  const statCards = [
    { label: "Total Users", value: data.stats.totalUsers, color: "text-blue-500" },
    { label: "Businesses", value: data.stats.totalBusinesses, color: "text-[#E8B547]" },
    { label: "Bookings", value: data.stats.totalBookings, color: "text-green-500" },
    { label: "Queue Entries", value: data.stats.totalQueueEntries, color: "text-purple-500" },
  ]

  const roleColors: Record<string, string> = {
    CUSTOMER: "bg-blue-500/10 text-blue-400",
    STAFF: "bg-green-500/10 text-green-400",
    BUSINESS_OWNER: "bg-[#E8B547]/10 text-[#E8B547]",
    ADMIN: "bg-red-500/10 text-red-400",
  }

  const planColors: Record<string, string> = {
    FREE: "bg-[#EFE9DA]/10 text-[#EFE9DA]/60",
    PRO: "bg-[#E8B547]/10 text-[#E8B547]",
    BUSINESS: "bg-blue-500/10 text-blue-400",
    ENTERPRISE: "bg-purple-500/10 text-purple-400",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#EFE9DA]">Admin Dashboard</h1>
        <p className="text-[#EFE9DA]/50 mt-1">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="text-center">
              <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-[#EFE9DA]/60 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.usersByRole.map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[item.role] || "bg-[#EFE9DA]/10 text-[#EFE9DA]/60"}`}>
                    {item.role.replace("_", " ")}
                  </span>
                  <span className="text-[#EFE9DA] font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Businesses by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Businesses by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.businessesByPlan.map((item) => (
                <div key={item.plan} className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${planColors[item.plan] || "bg-[#EFE9DA]/10 text-[#EFE9DA]/60"}`}>
                    {item.plan}
                  </span>
                  <span className="text-[#EFE9DA] font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-[#0A0F0D]">
                  <div>
                    <div className="text-sm font-medium text-[#EFE9DA]">{user.name || "Unnamed"}</div>
                    <div className="text-xs text-[#EFE9DA]/50">{user.email}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[user.role] || "bg-[#EFE9DA]/10 text-[#EFE9DA]/60"}`}>
                    {user.role.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Businesses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentBusinesses.map((biz) => (
                <div key={biz.id} className="flex items-center justify-between p-2 rounded-lg bg-[#0A0F0D]">
                  <div className="flex items-center gap-2">
                    {biz.template && <span className="text-xl">{biz.template.icon}</span>}
                    <div>
                      <div className="text-sm font-medium text-[#EFE9DA]">{biz.name}</div>
                      <div className="text-xs text-[#EFE9DA]/50">{biz.template?.name || "Unknown"}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${planColors[biz.plan] || "bg-[#EFE9DA]/10 text-[#EFE9DA]/60"}`}>
                    {biz.plan}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
