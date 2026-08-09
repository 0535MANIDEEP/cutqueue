"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Booking {
  id: string
  scheduledAt: string
  duration: number
  status: string
  notes: string | null
  service: { name: string; price: number }
  business: { name: string; address: string }
  staff: { user: { name: string | null } }
}

const tierColors: Record<string, string> = {
  BRONZE: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  SILVER: "bg-gray-500/10 text-gray-300 border-gray-400/30",
  GOLD: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  PLATINUM: "bg-purple-500/10 text-purple-400 border-purple-500/30",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  IN_PROGRESS: "bg-[#E8B547]/10 text-[#E8B547]",
  COMPLETED: "bg-green-500/10 text-green-400",
  CANCELLED: "bg-red-500/10 text-red-400",
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") fetchBookings()
  }, [status, router])

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings")
      if (res.ok) setBookings(await res.json())
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (id: string) => {
    if (!confirm("Cancel this booking?")) return
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "CANCELLED" }),
      })
      if (res.ok) fetchBookings()
    } catch (error) {
      console.error("Failed to cancel:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center">
        <div className="text-[#EFE9DA]/50">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  const upcomingBookings = bookings.filter(
    (b) => b.status === "PENDING" || b.status === "CONFIRMED"
  )
  const pastBookings = bookings.filter(
    (b) => b.status === "COMPLETED" || b.status === "CANCELLED"
  )

  return (
    <div className="min-h-screen bg-[#0A0F0D]">
      <header className="border-b border-[#263329] px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#EFE9DA]">My Bookings</h1>
            <p className="text-xs text-[#EFE9DA]/40">{session.user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/book">
              <Button variant="primary" size="sm">Book Now</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Points Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#EFE9DA]/50">Your Tier</p>
                <p className="text-2xl font-bold text-[#EFE9DA]">Bronze</p>
                <p className="text-xs text-[#EFE9DA]/40 mt-1">Earn points with every visit</p>
              </div>
              <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${tierColors.BRONZE}`}>
                0 pts
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <div>
          <h2 className="text-xl font-bold text-[#EFE9DA] mb-4">Upcoming</h2>
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-[#EFE9DA]/40 mb-4">No upcoming bookings</p>
                <Link href="/book">
                  <Button variant="primary">Book an Appointment</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#EFE9DA]">{booking.service.name}</div>
                        <div className="text-sm text-[#EFE9DA]/50">
                          {booking.business.name} · {booking.staff.user.name || "Any staff"}
                        </div>
                        <div className="text-sm text-[#EFE9DA]/40">
                          {new Date(booking.scheduledAt).toLocaleDateString()} at{" "}
                          {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                        {booking.status !== "CANCELLED" && (
                          <Button size="sm" variant="danger" onClick={() => cancelBooking(booking.id)}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#EFE9DA] mb-4">Past</h2>
            <div className="space-y-3">
              {pastBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-[#EFE9DA]">{booking.service.name}</div>
                        <div className="text-sm text-[#EFE9DA]/50">{booking.business.name}</div>
                        <div className="text-xs text-[#EFE9DA]/40">
                          {new Date(booking.scheduledAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                        <span className="text-sm text-[#E8B547]">${booking.service.price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
