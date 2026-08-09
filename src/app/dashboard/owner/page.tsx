"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { TrialBanner } from "@/components/trial-banner"

interface QueueEntry {
  id: string
  ticketNumber: number
  name: string
  serviceType: string | null
  joinedAt: string
}

interface QueueData {
  id: string
  currentNumber: number
  estimatedWait: number
  waiting: QueueEntry[]
  called: QueueEntry[]
  inProgress: QueueEntry[]
}

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  category: string
  isActive: boolean
}

interface Booking {
  id: string
  scheduledAt: string
  status: string
  customer: { name: string | null }
  service: { name: string }
  staff: { user: { name: string | null } }
}

type Tab = "queue" | "services" | "bookings" | "staff" | "settings" | "announcements"

export default function OwnerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("queue")
  const [queue, setQueue] = useState<QueueData | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [shopName, setShopName] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddService, setShowAddService] = useState(false)
  const [editingService, setEditingService] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "", duration: 30, price: 0, category: "general" })
  const [newService, setNewService] = useState({ name: "", description: "", duration: 30, price: 0, category: "general" })

  const fetchAll = async () => {
    try {
      const [queueRes, servicesRes, bookingsRes] = await Promise.all([
        fetch("/api/queue"),
        fetch("/api/services"),
        fetch("/api/bookings"),
      ])
      if (queueRes.ok) {
        const data = await queueRes.json()
        setQueue(data.queue)
        setShopName(data.business?.name || "Dashboard")
      }
      if (servicesRes.ok) setServices(await servicesRes.json())
      if (bookingsRes.ok) setBookings(await bookingsRes.json())
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") fetchAll()
  }, [status, router])

  const updateEntry = async (id: string, action: string) => {
    try {
      await fetch(`/api/queue/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      fetchAll()
    } catch (error) {
      console.error("Failed to update entry:", error)
    }
  }

  const addService = async () => {
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      })
      if (res.ok) {
        setShowAddService(false)
        setNewService({ name: "", description: "", duration: 30, price: 0, category: "general" })
        fetchAll()
      }
    } catch (error) {
      console.error("Failed to add service:", error)
    }
  }

  const updateService = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        setEditingService(null)
        fetchAll()
      }
    } catch (error) {
      console.error("Failed to update service:", error)
    }
  }

  const toggleService = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      fetchAll()
    } catch (error) {
      console.error("Failed to toggle service:", error)
    }
  }

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchAll()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to delete")
      }
    } catch (error) {
      console.error("Failed to delete service:", error)
    }
  }

  const startEdit = (s: Service) => {
    setEditingService(s.id)
    setEditForm({ name: s.name, description: "", duration: s.duration, price: s.price, category: s.category })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center">
        <div className="text-[#EFE9DA]/50">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "queue", label: "Queue", count: queue?.waiting.length },
    { id: "services", label: "Services", count: services.length },
    { id: "bookings", label: "Bookings", count: bookings.length },
    { id: "staff", label: "Staff" },
    { id: "announcements", label: "Announcements" },
    { id: "settings", label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-[#0A0F0D]">
      <header className="border-b border-[#263329] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E8B547] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#0A0F0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#EFE9DA]">{shopName || "Dashboard"}</h1>
              <p className="text-xs text-[#EFE9DA]/40">{session.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/portfolio">
              <Button variant="outline" size="sm">Portfolio</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <TrialBanner />
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-[#E8B547]">{queue?.waiting.length || 0}</div>
              <div className="text-sm text-[#EFE9DA]/60">Waiting</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-500">{queue?.inProgress.length || 0}</div>
              <div className="text-sm text-[#EFE9DA]/60">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-[#EFE9DA]">{queue?.estimatedWait || 0}m</div>
              <div className="text-sm text-[#EFE9DA]/60">Est. Wait</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#263329] pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (t.id === "settings") {
                  router.push("/dashboard/owner/settings")
                } else if (t.id === "announcements") {
                  router.push("/dashboard/owner/announcements")
                } else {
                  setTab(t.id)
                }
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-[#E8B547]/10 text-[#E8B547]"
                  : "text-[#EFE9DA]/50 hover:text-[#EFE9DA]"
              )}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-[#263329] text-xs">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Queue Tab */}
        {tab === "queue" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Waiting Queue</CardTitle>
                  {queue?.waiting && queue.waiting.length > 0 && (
                    <Button variant="primary" size="sm" onClick={() => updateEntry(queue.waiting[0].id, "call")}>
                      Call Next — #{queue.waiting[0].ticketNumber}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {queue?.waiting.length === 0 ? (
                  <p className="text-[#EFE9DA]/40 text-sm">Queue is empty</p>
                ) : (
                  <div className="space-y-2">
                    {queue?.waiting.map((entry, i) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border bg-[#141C18]",
                          i === 0 ? "border-[#E8B547]/30 bg-[#E8B547]/5" : "border-[#263329]/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                            i === 0 ? "bg-[#E8B547] text-[#0A0F0D]" : "bg-[#263329] text-[#EFE9DA]/60"
                          )}>
                            {entry.ticketNumber}
                          </div>
                          <div>
                            <div className="font-medium text-[#EFE9DA]">{entry.name}</div>
                            <div className="text-xs text-[#EFE9DA]/50">{entry.serviceType || "Service"}</div>
                          </div>
                        </div>
                        {i === 0 && <span className="text-xs font-mono text-[#E8B547]">NEXT</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Called</CardTitle></CardHeader>
                <CardContent>
                  {queue?.called.length === 0 ? (
                    <p className="text-[#EFE9DA]/40 text-sm">No one called</p>
                  ) : (
                    <div className="space-y-3">
                      {queue?.called.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-[#E8B547]/10 border border-[#E8B547]/30">
                          <div>
                            <div className="font-semibold text-[#EFE9DA]">#{entry.ticketNumber} — {entry.name}</div>
                            <div className="text-xs text-[#EFE9DA]/50">{entry.serviceType || "Service"}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="primary" onClick={() => updateEntry(entry.id, "start")}>Start</Button>
                            <Button size="sm" variant="outline" onClick={() => updateEntry(entry.id, "cancel")}>Cancel</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>In Progress</CardTitle></CardHeader>
                <CardContent>
                  {queue?.inProgress.length === 0 ? (
                    <p className="text-[#EFE9DA]/40 text-sm">No active services</p>
                  ) : (
                    <div className="space-y-3">
                      {queue?.inProgress.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                          <div>
                            <div className="font-semibold text-[#EFE9DA]">#{entry.ticketNumber} — {entry.name}</div>
                            <div className="text-xs text-[#EFE9DA]/50">{entry.serviceType || "Service"}</div>
                          </div>
                          <Button size="sm" variant="primary" onClick={() => updateEntry(entry.id, "complete")}>Complete</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {tab === "services" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#EFE9DA]">Service Catalogue</h2>
              <Button variant="primary" onClick={() => setShowAddService(true)}>+ Add Service</Button>
            </div>

            {showAddService && (
              <Card>
                <CardHeader><CardTitle>New Service</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#EFE9DA]/60 mb-1">Name *</label>
                      <Input value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="Haircut" />
                    </div>
                    <div>
                      <label className="block text-sm text-[#EFE9DA]/60 mb-1">Category</label>
                      <Input value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} placeholder="haircut" />
                    </div>
                    <div>
                      <label className="block text-sm text-[#EFE9DA]/60 mb-1">Duration (min) *</label>
                      <Input type="number" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <label className="block text-sm text-[#EFE9DA]/60 mb-1">Price ($) *</label>
                      <Input type="number" step="0.01" value={newService.price} onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#EFE9DA]/60 mb-1">Description</label>
                    <textarea
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      rows={2}
                      placeholder="Optional description for your customers"
                      className="w-full rounded-lg bg-[#0F1B17] border border-[#2A3F3A] px-4 py-3 text-[#EFE9DA] placeholder:text-[#EFE9DA]/40 focus:outline-none focus:ring-2 focus:ring-[#E8B547]/50 focus:border-[#E8B547] transition-all duration-200 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="primary" onClick={addService} disabled={!newService.name}>Save</Button>
                    <Button variant="outline" onClick={() => setShowAddService(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {services.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-[#EFE9DA]/40 text-sm mb-4">No services yet. Add your first service to get started.</p>
                  <Button variant="primary" onClick={() => setShowAddService(true)}>+ Add Service</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {services.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="p-4">
                      {editingService === s.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Service name" />
                            <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} placeholder="Category" />
                            <Input type="number" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })} />
                            <Input type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })} />
                          </div>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={2}
                            placeholder="Description"
                            className="w-full rounded-lg bg-[#0F1B17] border border-[#2A3F3A] px-4 py-3 text-[#EFE9DA] placeholder:text-[#EFE9DA]/40 focus:outline-none focus:ring-2 focus:ring-[#E8B547]/50 focus:border-[#E8B547] transition-all duration-200 resize-none"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="primary" onClick={() => updateService(s.id)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingService(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium text-[#EFE9DA]">{s.name}</h3>
                              <span className="px-2 py-0.5 rounded text-xs bg-[#263329] text-[#EFE9DA]/60">{s.category}</span>
                              {!s.isActive && (
                                <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400">Inactive</span>
                              )}
                            </div>
                            {s.description && (
                              <p className="text-xs text-[#EFE9DA]/40 mt-1">{s.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-[#E8B547]">${s.price}</div>
                              <div className="text-xs text-[#EFE9DA]/50">{s.duration} min</div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => toggleService(s.id, s.isActive)}
                                className={`p-1.5 rounded ${s.isActive ? "text-green-400 hover:bg-green-500/10" : "text-red-400 hover:bg-red-500/10"}`}
                                title={s.isActive ? "Deactivate" : "Activate"}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {s.isActive ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  )}
                                </svg>
                              </button>
                              <button
                                onClick={() => startEdit(s)}
                                className="p-1.5 rounded text-[#EFE9DA]/50 hover:text-[#EFE9DA] hover:bg-[#263329]"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteService(s.id)}
                                className="p-1.5 rounded text-[#EFE9DA]/50 hover:text-red-400 hover:bg-red-500/10"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {tab === "bookings" && (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#263329]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Service</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Staff</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-[#263329]/50">
                      <td className="px-4 py-3 text-sm text-[#EFE9DA]">{b.customer.name || "Customer"}</td>
                      <td className="px-4 py-3 text-sm text-[#EFE9DA]/70">{b.service.name}</td>
                      <td className="px-4 py-3 text-sm text-[#EFE9DA]/70">{b.staff.user.name || "Any"}</td>
                      <td className="px-4 py-3 text-sm text-[#EFE9DA]/70">{new Date(b.scheduledAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          b.status === "COMPLETED" ? "bg-green-500/10 text-green-400" :
                          b.status === "CANCELLED" ? "bg-red-500/10 text-red-400" :
                          "bg-yellow-500/10 text-yellow-400"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Staff Tab */}
        {tab === "staff" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => router.push("/dashboard/owner/staff")}>
                Manage Staff
              </Button>
            </div>
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-[#EFE9DA]/40 text-sm">
                  Go to the Staff Schedule page to manage availability and view staff details.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <Card>
            <CardHeader><CardTitle>Business Settings</CardTitle></CardHeader>
            <CardContent>
              <p className="text-[#EFE9DA]/40 text-sm mb-4">Manage your business information, opening hours, and preferences.</p>
              <Button variant="primary" onClick={() => router.push("/dashboard/owner/settings")}>
                Open Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Announcements Tab */}
        {tab === "announcements" && (
          <Card>
            <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
            <CardContent>
              <p className="text-[#EFE9DA]/40 text-sm mb-4">Create and manage announcements for your customers.</p>
              <Button variant="primary" onClick={() => router.push("/dashboard/owner/announcements")}>
                Manage Announcements
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
