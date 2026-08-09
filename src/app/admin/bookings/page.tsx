"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Booking {
  id: string
  scheduledAt: string
  duration: number
  status: string
  paymentStatus: string
  notes: string | null
  createdAt: string
  customer: { name: string | null; email: string }
  staff: { user: { name: string | null } }
  service: { name: string; price: number }
  business: { name: string }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings")
      if (res.ok) {
        setBookings(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })

      if (res.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error("Failed to update booking:", error)
    }
  }

  const filteredBookings = bookings.filter(
    (b) =>
      b.customer.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.email.toLowerCase().includes(search.toLowerCase()) ||
      b.business.name.toLowerCase().includes(search.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400",
    CONFIRMED: "bg-blue-500/10 text-blue-400",
    IN_PROGRESS: "bg-[#E8B547]/10 text-[#E8B547]",
    COMPLETED: "bg-green-500/10 text-green-400",
    CANCELLED: "bg-red-500/10 text-red-400",
    NO_SHOW: "bg-gray-500/10 text-gray-400",
  }

  const paymentColors: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400",
    PAID: "bg-green-500/10 text-green-400",
    REFUNDED: "bg-blue-500/10 text-blue-400",
    FAILED: "bg-red-500/10 text-red-400",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#EFE9DA]/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#EFE9DA]">Bookings</h1>
          <p className="text-[#EFE9DA]/50 mt-1">{bookings.length} total bookings</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search bookings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#263329]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Business</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Staff</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Payment</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-[#263329]/50 hover:bg-[#141C18]">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-[#EFE9DA]">{booking.customer.name || "Unnamed"}</div>
                      <div className="text-xs text-[#EFE9DA]/50">{booking.customer.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-[#EFE9DA]">{booking.service.name}</div>
                      <div className="text-xs text-[#E8B547]">${booking.service.price}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#EFE9DA]/70">{booking.business.name}</td>
                    <td className="px-4 py-3 text-sm text-[#EFE9DA]/70">{booking.staff.user.name || "Any"}</td>
                    <td className="px-4 py-3 text-sm text-[#EFE9DA]/70">
                      {new Date(booking.scheduledAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[booking.status] || ""}`}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${paymentColors[booking.paymentStatus] || ""}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {booking.status === "PENDING" && (
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(booking.id, "CONFIRMED")}>
                            Confirm
                          </Button>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(booking.id, "IN_PROGRESS")}>
                            Start
                          </Button>
                        )}
                        {booking.status === "IN_PROGRESS" && (
                          <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(booking.id, "COMPLETED")}>
                            Complete
                          </Button>
                        )}
                        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                          <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(booking.id, "CANCELLED")}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
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
