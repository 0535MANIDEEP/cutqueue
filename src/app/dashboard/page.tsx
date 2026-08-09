"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [queue, setQueue] = useState<QueueData | null>(null)
  const [shopName, setShopName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    if (status === "authenticated") {
      fetchQueue()
    }
  }, [status, router])

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/queue")
      if (res.ok) {
        const data = await res.json()
        setQueue(data.queue)
        setShopName(data.business?.name || "Dashboard")
      }
    } catch (error) {
      console.error("Failed to fetch queue:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateEntry = async (id: string, action: string) => {
    try {
      await fetch(`/api/queue/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      fetchQueue()
    } catch (error) {
      console.error("Failed to update entry:", error)
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
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-[#E8B547]">
                {queue?.waiting.length || 0}
              </div>
              <div className="text-sm text-[#EFE9DA]/60">Waiting</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-green-500">
                {queue?.inProgress.length || 0}
              </div>
              <div className="text-sm text-[#EFE9DA]/60">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-4xl font-bold text-[#EFE9DA]">
                {queue?.estimatedWait || 0}m
              </div>
              <div className="text-sm text-[#EFE9DA]/60">Est. Wait</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Called</CardTitle>
            </CardHeader>
            <CardContent>
              {queue?.called.length === 0 ? (
                <p className="text-[#EFE9DA]/40 text-sm">No one called yet</p>
              ) : (
                <div className="space-y-3">
                  {queue?.called.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#E8B547]/10 border border-[#E8B547]/30"
                    >
                      <div>
                        <div className="font-semibold text-[#EFE9DA]">
                          #{entry.ticketNumber} — {entry.name}
                        </div>
                        <div className="text-xs text-[#EFE9DA]/50">
                          {entry.serviceType || "Haircut"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => updateEntry(entry.id, "start")}
                        >
                          Start
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateEntry(entry.id, "cancel")}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {queue?.inProgress.length === 0 ? (
                <p className="text-[#EFE9DA]/40 text-sm">No active services</p>
              ) : (
                <div className="space-y-3">
                  {queue?.inProgress.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30"
                    >
                      <div>
                        <div className="font-semibold text-[#EFE9DA]">
                          #{entry.ticketNumber} — {entry.name}
                        </div>
                        <div className="text-xs text-[#EFE9DA]/50">
                          {entry.serviceType || "Haircut"}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => updateEntry(entry.id, "complete")}
                      >
                        Complete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Waiting Queue</CardTitle>
                {queue?.waiting && queue.waiting.length > 0 && (
                  <Button
                    variant="primary"
                    onClick={() => updateEntry(queue.waiting[0].id, "call")}
                  >
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
                        "flex items-center justify-between p-3 rounded-lg border border-[#263329]/50 bg-[#141C18]",
                        i === 0 && "border-[#E8B547]/30 bg-[#E8B547]/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                            i === 0
                              ? "bg-[#E8B547] text-[#0A0F0D]"
                              : "bg-[#263329] text-[#EFE9DA]/60"
                          )}
                        >
                          {entry.ticketNumber}
                        </div>
                        <div>
                          <div className="font-medium text-[#EFE9DA]">{entry.name}</div>
                          <div className="text-xs text-[#EFE9DA]/50">
                            {entry.serviceType || "Haircut"} •{" "}
                            {new Date(entry.joinedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      {i === 0 && (
                        <span className="text-xs font-mono text-[#E8B547]">NEXT</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
