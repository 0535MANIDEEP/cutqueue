"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/layout/header"

interface QueueEntry {
  id: string
  ticketNumber: number
  status: string
  serviceType: string
  joinedAt: string
  customerId: string
  customer: { name: string }
  position: number | null
}

interface Booking {
  id: string
  scheduledAt: string
  status: string
  customer: { name: string }
  service: { name: string }
}

export default function OwnerDashboard() {
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<{ id: string; name: string }[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [tab, setTab] = useState<"queue" | "bookings">("queue")
  const [error, setError] = useState("")
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [walkInName, setWalkInName] = useState("")
  const [walkInPhone, setWalkInPhone] = useState("")
  const [walkInService, setWalkInService] = useState("")
  const [addingWalkIn, setAddingWalkIn] = useState(false)
  const [invoiceGenerating, setInvoiceGenerating] = useState<string | null>(null)
  const [generatedInvoice, setGeneratedInvoice] = useState<Record<string, unknown> | null>(null)
  const [invoiceAmount, setInvoiceAmount] = useState("")
  const [invoiceEntryId, setInvoiceEntryId] = useState<string | null>(null)
  const [invoiceServiceName, setInvoiceServiceName] = useState("")

  const fetchData = useCallback(async (bid: string) => {
    try {
      const [queueRes, bookingsRes, servicesRes] = await Promise.all([
        fetch(`/api/queue?businessId=${bid}`),
        fetch(`/api/bookings?businessId=${bid}`),
        fetch(`/api/services?businessId=${bid}`),
      ])
      if (queueRes.ok) {
        const d = await queueRes.json()
        setQueue(d.entries || [])
      }
      if (bookingsRes.ok) {
        const d = await bookingsRes.json()
        setBookings(Array.isArray(d) ? d : d.bookings || [])
      }
      if (servicesRes.ok) {
        const d = await servicesRes.json()
        setServices(Array.isArray(d) ? d : [])
      }
    } catch {
      setError("Failed to load data")
    }
  }, [])

  useEffect(() => {
    fetch("/api/business/settings")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load business settings")
        return r.json()
      })
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
    const interval = setInterval(() => fetchData(businessId), 5000)
    return () => clearInterval(interval)
  }, [businessId, fetchData])

  const addWalkIn = async () => {
    if (!walkInName.trim() || !businessId) return
    setAddingWalkIn(true)
    try {
      const res = await fetch("/api/queue/walkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          customerName: walkInName.trim(),
          customerPhone: walkInPhone.trim() || undefined,
          serviceType: walkInService || "General",
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to add walk-in")
        return
      }
      setWalkInName("")
      setWalkInPhone("")
      setWalkInService("")
      setShowWalkIn(false)
      if (businessId) fetchData(businessId)
    } catch {
      setError("Network error")
    } finally {
      setAddingWalkIn(false)
    }
  }

  const callNext = async (entryId: string) => {
    try {
      const res = await fetch(`/api/queue/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "call" }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to call next")
        return
      }
      if (businessId) fetchData(businessId)
    } catch {
      setError("Network error")
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
        setError(err.error || "Failed to complete")
        return
      }
      if (businessId) fetchData(businessId)
    } catch {
      setError("Network error")
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
      setError("Network error")
    }
  }

  const generateInvoice = async (entryId: string, serviceName: string) => {
    if (!businessId) return
    setInvoiceEntryId(entryId)
    setInvoiceServiceName(serviceName)
    setInvoiceAmount("")
  }

  const submitInvoice = async () => {
    if (!businessId || !invoiceEntryId || !invoiceAmount) return
    setInvoiceGenerating(invoiceEntryId)
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          queueEntryId: invoiceEntryId,
          serviceName: invoiceServiceName,
          amount: Number(invoiceAmount),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to generate invoice")
        return
      }
      const invoice = await res.json()
      setGeneratedInvoice(invoice)
      setInvoiceEntryId(null)
    } catch {
      setError("Network error")
    } finally {
      setInvoiceGenerating(null)
    }
  }

  const waiting = queue.filter(e => e.status === "WAITING")
  const serving = queue.filter(e => e.status === "CALLED" || e.status === "IN_PROGRESS")
  const todayStr = new Date().toLocaleDateString("en-CA")
  const todayBookings = bookings.filter(b => new Date(b.scheduledAt).toLocaleDateString("en-CA") === todayStr)

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
            {!showWalkIn ? (
              <button
                onClick={() => setShowWalkIn(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-base font-semibold hover:bg-blue-700 transition"
              >
                + Add Walk-in
              </button>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="font-semibold text-gray-900">New Walk-in</p>
                <input
                  type="text"
                  placeholder="Customer name *"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  autoFocus
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <select
                  value={walkInService}
                  onChange={(e) => setWalkInService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">Select service</option>
                  {services.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                  <option value="General">General</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowWalkIn(false)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addWalkIn}
                    disabled={!walkInName.trim() || addingWalkIn}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {addingWalkIn ? "Adding..." : "Add to Queue"}
                  </button>
                </div>
              </div>
            )}

            {serving.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Now Serving</h3>
                {serving.map(entry => (
                  <div key={entry.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{entry.customer?.name}</p>
                        <p className="text-sm text-gray-600">{entry.serviceType}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => generateInvoice(entry.id, entry.serviceType)}
                          disabled={invoiceGenerating === entry.id}
                          className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
                        >
                          {invoiceGenerating === entry.id ? "..." : "Invoice"}
                        </button>
                        <button
                          onClick={() => completeService(entry.id)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
                        >
                          Done
                        </button>
                      </div>
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
                        #{entry.ticketNumber}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.customer?.name}</p>
                        <p className="text-sm text-gray-500">{entry.serviceType}</p>
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

      {invoiceEntryId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-4">Generate Invoice</h3>
            <p className="text-sm text-gray-500 mb-3">{invoiceServiceName}</p>
            <div className="mb-4">
              <label className="text-sm text-gray-500">Amount (₹)</label>
              <input
                type="number"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder="0.00"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-lg font-semibold"
                autoFocus
                min="0"
                step="0.01"
              />
              {invoiceAmount && (
                <div className="mt-2 text-sm text-gray-500">
                  <p>Subtotal: ₹{Number(invoiceAmount).toFixed(2)}</p>
                  <p>CGST (2.5%): ₹{(Number(invoiceAmount) * 0.025).toFixed(2)}</p>
                  <p>SGST (2.5%): ₹{(Number(invoiceAmount) * 0.025).toFixed(2)}</p>
                  <p className="font-semibold text-gray-900">Total: ₹{(Number(invoiceAmount) * 1.05).toFixed(2)}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setInvoiceEntryId(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={submitInvoice}
                disabled={!invoiceAmount || invoiceGenerating !== null}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {invoiceGenerating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {generatedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">GST Invoice</h3>
              <button onClick={() => setGeneratedInvoice(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice #</span>
                <span className="font-mono">{generatedInvoice.invoiceNumber as string}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Business</span>
                <span>{(generatedInvoice.business as Record<string, unknown>)?.name as string}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span>{new Date(generatedInvoice.date as string).toLocaleDateString("en-IN")}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{(generatedInvoice.subtotal as number).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CGST (2.5%)</span>
                <span>₹{(generatedInvoice.gst as Record<string, number>)?.cgst?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SGST (2.5%)</span>
                <span>₹{(generatedInvoice.gst as Record<string, number>)?.sgst?.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>₹{(generatedInvoice.total as number).toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">Enter amount manually in the item list</p>
          </div>
        </div>
      )}
    </div>
  )
}
