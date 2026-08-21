'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QueueEntry {
  id: string
  ticketNumber: number
  customer: { name: string }
  serviceType?: string
  status: 'WAITING' | 'CALLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  joinedAt: string
}

interface QueueData {
  queue: { id: string; isActive: boolean } | null
  entries: QueueEntry[]
  waitingCount: number
  estimatedWait: number
}

const statusColors = {
  WAITING: 'bg-[#2A3F3A] text-[#EFE9DA]',
  CALLED: 'bg-[#E8B547] text-[#0F1B17] animate-pulse',
  IN_PROGRESS: 'bg-green-600 text-white',
  COMPLETED: 'bg-[#1E2E29] text-[#EFE9DA]/40 line-through',
  CANCELLED: 'bg-red-900/30 text-red-400/50',
}

const statusLabels = {
  WAITING: 'Waiting',
  CALLED: 'Called',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Done',
  CANCELLED: 'Cancelled',
}

export default function QueuePage() {
  const { data: session } = useSession()
  const [queueData, setQueueData] = useState<QueueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setMounted(true)
    fetchBusinesses()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (selectedBusiness) {
      fetchQueue()
      const interval = setInterval(fetchQueue, 10000)
      return () => clearInterval(interval)
    }
  }, [selectedBusiness])

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/shops')
      if (res.ok) {
        const data = await res.json()
        setBusinesses(data)
        if (data.length > 0) setSelectedBusiness(data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQueue = async () => {
    if (!selectedBusiness) return
    try {
      const res = await fetch(`/api/queue?businessId=${selectedBusiness}`)
      if (res.ok) {
        const data = await res.json()
        setQueueData(data)
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error)
    }
  }

  const joinQueue = async () => {
    if (!selectedBusiness || !session?.user) return
    setJoining(true)
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: selectedBusiness }),
      })
      if (res.ok) {
        fetchQueue()
      } else {
        const err = await res.json()
        setError(err.error || "Failed to join queue")
      }
    } catch (error) {
      console.error('Failed to join queue:', error)
      setError("Network error. Please try again.")
    } finally {
      setJoining(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatWaitTime = (joinedAt: string) => {
    const diff = Math.floor((currentTime.getTime() - new Date(joinedAt).getTime()) / 60000)
    if (diff < 1) return 'Just now'
    return `${diff}m ago`
  }

  const myEntry = queueData?.entries.find(
    (e) => e.customer.name === session?.user?.name && ['WAITING', 'CALLED', 'IN_PROGRESS'].includes(e.status)
  )

  const leaveQueue = async () => {
    if (!myEntry) return
    try {
      const res = await fetch("/api/queue/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: myEntry.id }),
      })
      if (res.ok) {
        fetchQueue()
      } else {
        const err = await res.json()
        setError(err.error || "Failed to leave queue")
      }
    } catch {
      setError("Network error. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1B17] pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-2">Live Queue</h1>
          <p className="text-[#EFE9DA]/60">Real-time queue status</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 font-bold">×</button>
          </div>
        )}

        {businesses.length > 0 && (
          <div className="mb-6">
            <label className="text-sm text-[#EFE9DA]/60 mb-2 block">Select Business</label>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-[#1E2E29] border border-[#2A3F3A] text-[#EFE9DA] focus:outline-none focus:border-[#E8B547]"
              aria-label="Select business"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-[#E8B547]">{queueData?.waitingCount ?? 0}</div>
              <div className="text-sm text-[#EFE9DA]/60">Waiting</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-500">{queueData?.estimatedWait ?? 0}m</div>
              <div className="text-sm text-[#EFE9DA]/60">Est. Wait</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-[#EFE9DA]">
                {queueData?.entries.filter((e) => e.status === 'COMPLETED').length ?? 0}
              </div>
              <div className="text-sm text-[#EFE9DA]/60">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-[#EFE9DA]">{mounted ? formatTime(currentTime) : '--:--'}</div>
              <div className="text-sm text-[#EFE9DA]/60">Current Time</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Queue Status</CardTitle>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-[#EFE9DA]/60">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-[#EFE9DA]/50">Loading queue...</div>
            ) : queueData?.entries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#EFE9DA]/60 mb-4">No one in queue yet</p>
                <p className="text-sm text-[#EFE9DA]/40">Be the first to join!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queueData?.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-lg border transition-all duration-300',
                      entry.status === 'CALLED'
                        ? 'border-[#E8B547] bg-[#E8B547]/10'
                        : 'border-[#2A3F3A]/50 bg-[#1E2E29]',
                      entry.status === 'COMPLETED' && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg',
                          statusColors[entry.status]
                        )}
                      >
                        {String(entry.ticketNumber).padStart(4, '0')}
                      </div>
                      <div>
                        <div className="font-medium text-[#EFE9DA]">
                          {entry.customer.name}
                          {myEntry?.id === entry.id && (
                            <span className="ml-2 text-xs text-[#E8B547]">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-[#EFE9DA]/60">
                          {entry.serviceType || 'General'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-[#EFE9DA]/60">{formatWaitTime(entry.joinedAt)}</div>
                      </div>
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          statusColors[entry.status]
                        )}
                      >
                        {statusLabels[entry.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-[#2A3F3A]/50">
              {!session?.user ? (
                <Button variant="primary" size="lg" className="w-full" disabled>
                  Sign in to Join Queue
                </Button>
              ) : myEntry ? (
                <div className="text-center">
                  <p className="text-[#E8B547] font-medium mb-2">
                    You&apos;re in queue! Ticket #{myEntry.ticketNumber}
                  </p>
                  <p className="text-sm text-[#EFE9DA]/50 mb-3">
                    Status: {statusLabels[myEntry.status]}
                  </p>
                  {myEntry.status === "WAITING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={leaveQueue}
                      className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                    >
                      Leave Queue
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={joinQueue}
                  disabled={joining || !selectedBusiness}
                >
                  {joining ? 'Joining...' : 'Join Queue'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
