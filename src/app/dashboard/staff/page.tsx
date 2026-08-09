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
  customer: { name: string | null; email: string }
  service: { name: string; price: number }
}

interface PortfolioImage {
  id: string
  imageUrl: string
  caption: string | null
  category: string
  likes: number
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  IN_PROGRESS: "bg-[#E8B547]/10 text-[#E8B547]",
  COMPLETED: "bg-green-500/10 text-green-400",
  CANCELLED: "bg-red-500/10 text-red-400",
}

export default function StaffDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"bookings" | "portfolio">("bookings")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [bookingsRes, portfolioRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/portfolio"),
      ])
      if (bookingsRes.ok) setBookings(await bookingsRes.json())
      if (portfolioRes.ok) setPortfolio(await portfolioRes.json())
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateBooking = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) fetchData()
    } catch (error) {
      console.error("Failed to update booking:", error)
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

  const todayBookings = bookings.filter((b) => {
    const date = new Date(b.scheduledAt)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  })

  return (
    <div className="min-h-screen bg-[#0A0F0D]">
      <header className="border-b border-[#263329] px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#EFE9DA]">Staff Dashboard</h1>
            <p className="text-xs text-[#EFE9DA]/40">{session.user?.name || session.user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/book">
              <Button variant="outline" size="sm">Book</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "bookings"
                ? "bg-[#E8B547]/10 text-[#E8B547]"
                : "text-[#EFE9DA]/50 hover:text-[#EFE9DA]"
            }`}
          >
            My Bookings ({todayBookings.length} today)
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "portfolio"
                ? "bg-[#E8B547]/10 text-[#E8B547]"
                : "text-[#EFE9DA]/50 hover:text-[#EFE9DA]"
            }`}
          >
            Portfolio ({portfolio.length})
          </button>
        </div>

        {activeTab === "bookings" && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-[#EFE9DA]/40">No bookings assigned yet</p>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#EFE9DA]">{booking.customer.name || "Customer"}</div>
                        <div className="text-sm text-[#EFE9DA]/50">{booking.service.name} · {booking.duration}min</div>
                        <div className="text-xs text-[#EFE9DA]/40">
                          {new Date(booking.scheduledAt).toLocaleDateString()} at{" "}
                          {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                        {booking.status === "CONFIRMED" && (
                          <Button size="sm" variant="primary" onClick={() => updateBooking(booking.id, "IN_PROGRESS")}>
                            Start
                          </Button>
                        )}
                        {booking.status === "IN_PROGRESS" && (
                          <Button size="sm" variant="primary" onClick={() => updateBooking(booking.id, "COMPLETED")}>
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-4">
            {portfolio.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-[#EFE9DA]/40 mb-4">No portfolio images yet</p>
                  <Link href="/portfolio">
                    <Button variant="outline">View Portfolio</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {portfolio.map((img) => (
                  <div key={img.id} className="aspect-square rounded-lg bg-[#141C18] border border-[#263329] overflow-hidden relative group">
                    <img src={img.imageUrl} alt={img.caption || ""} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div>
                        <p className="text-sm font-medium text-[#EFE9DA]">{img.caption || "No caption"}</p>
                        <p className="text-xs text-[#EFE9DA]/50">{img.category} · {img.likes} likes</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
