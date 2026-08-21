"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface QueueEntry {
  id: string
  ticketNumber: number
  status: string
  serviceType: string
  joinedAt: string
  position: number | null
}

interface QueueData {
  queue: { id: string; isActive: boolean } | null
  entries: QueueEntry[]
  waitingCount: number
  estimatedWait: number
  avgServiceTime: number
}

function QueueStatus() {
  const searchParams = useSearchParams()
  const businessId = searchParams.get("businessId")
  const ticket = searchParams.get("ticket")
  const [data, setData] = useState<QueueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    if (!businessId) return
    try {
      const res = await fetch(`/api/queue/public?businessId=${businessId}`)
      if (!res.ok) {
        setError("Failed to load queue status")
        return
      }
      const d = await res.json()
      setData(d)
      setLoading(false)
    } catch {
      setError("Network error")
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (!businessId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full border border-gray-100">
          <p className="text-gray-500">Invalid queue link</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full border border-gray-100">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading queue...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full border border-gray-100">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchData} className="mt-4 text-blue-600 text-sm font-medium">Retry</button>
        </div>
      </div>
    )
  }

  if (!data?.queue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full border border-gray-100">
          <p className="text-gray-500">Queue not found</p>
        </div>
      </div>
    )
  }

  if (!data.queue.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full border border-gray-100">
          <p className="text-gray-700 font-semibold">Queue is closed</p>
          <p className="text-gray-400 text-sm mt-1">Please check back later</p>
        </div>
      </div>
    )
  }

  const myEntry = ticket
    ? data.entries.find(e => e.ticketNumber === Number(ticket))
    : null

  if (!myEntry) {
    if (ticket) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full border border-gray-100">
            <p className="text-gray-700 font-semibold">Ticket #{ticket} not found</p>
            <p className="text-gray-400 text-sm mt-1">Ask the shop to add you to the queue</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full border border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Live Queue</h1>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-blue-600">{data.waitingCount}</p>
              <p className="text-xs text-gray-500 mt-1">People Waiting</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-amber-600">{data.estimatedWait}m</p>
              <p className="text-xs text-gray-500 mt-1">Est. Wait</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-6">Ask the shop for your ticket number</p>
        </div>
      </div>
    )
  }

  const myPosition = myEntry.position ?? (myEntry.status === "WAITING"
    ? data.entries.filter(e => e.status === "WAITING" && e.ticketNumber < myEntry.ticketNumber).length + 1
    : 0)

  const statusConfig = {
    WAITING: { label: "In Queue", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    CALLED: { label: "Your Turn!", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    IN_PROGRESS: { label: "Being Served", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    COMPLETED: { label: "Done", color: "text-gray-400", bg: "bg-gray-50", border: "border-gray-200" },
    CANCELLED: { label: "Cancelled", color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  }

  const status = statusConfig[myEntry.status as keyof typeof statusConfig] || statusConfig.WAITING

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full border border-gray-100">
        <div className="text-center mb-6">
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${status.bg} ${status.color} ${status.border} border`}>
            {status.label}
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-gray-400 mb-1">Your Ticket</p>
          <p className="text-6xl font-bold text-gray-900">#{myEntry.ticketNumber}</p>
        </div>

        {myEntry.status === "WAITING" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{myPosition}</p>
              <p className="text-xs text-gray-500 mt-1">Your Position</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{myPosition * data.avgServiceTime}m</p>
              <p className="text-xs text-gray-500 mt-1">Est. Wait</p>
            </div>
          </div>
        )}

        {myEntry.status === "CALLED" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mb-6 animate-pulse">
            <p className="text-lg font-bold text-amber-700">Please proceed to the counter!</p>
          </div>
        )}

        {myEntry.status === "IN_PROGRESS" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center mb-6">
            <p className="text-lg font-bold text-emerald-700">You are being served</p>
          </div>
        )}

        <div className="space-y-2 mb-6">
          {data.entries.filter(e => e.status === "WAITING").slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                entry.id === myEntry.id ? "bg-blue-100 border border-blue-300 font-semibold" : ""
              }`}
            >
              <span className="text-gray-600">
                #{entry.ticketNumber}
                {entry.id === myEntry.id && <span className="ml-2 text-blue-600">(You)</span>}
              </span>
              <span className="text-gray-400">{entry.serviceType}</span>
            </div>
          ))}
          {data.waitingCount > 10 && (
            <p className="text-center text-gray-400 text-xs">+{data.waitingCount - 10} more</p>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs">
          Updates automatically every 5 seconds
        </p>
      </div>
    </div>
  )
}

export default function QueueStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <QueueStatus />
    </Suspense>
  )
}
