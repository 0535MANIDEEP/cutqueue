'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QueueEntry {
  id: string
  ticketNumber: number
  name: string
  service: string
  status: 'waiting' | 'called' | 'in-progress' | 'completed'
  joinedAt: Date
}

const mockQueue: QueueEntry[] = [
  { id: '1', ticketNumber: 1001, name: 'Marcus J.', service: 'Fade + Beard', status: 'completed', joinedAt: new Date(Date.now() - 45 * 60000) },
  { id: '2', ticketNumber: 1002, name: 'Andre W.', service: 'Classic Cut', status: 'in-progress', joinedAt: new Date(Date.now() - 30 * 60000) },
  { id: '3', ticketNumber: 1003, name: 'DeShawn M.', service: 'Skin Fade', status: 'called', joinedAt: new Date(Date.now() - 20 * 60000) },
  { id: '4', ticketNumber: 1004, name: 'Chris P.', service: 'Beard Trim', status: 'waiting', joinedAt: new Date(Date.now() - 15 * 60000) },
  { id: '5', ticketNumber: 1005, name: 'Jamal K.', service: 'Kids Cut', status: 'waiting', joinedAt: new Date(Date.now() - 10 * 60000) },
  { id: '6', ticketNumber: 1006, name: 'Tyler R.', service: 'Fade + Line', status: 'waiting', joinedAt: new Date(Date.now() - 5 * 60000) },
]

const statusColors = {
  waiting: 'bg-[#2A3F3A] text-[#EFE9DA]',
  called: 'bg-[#E8B547] text-[#0F1B17] animate-pulse-gold',
  'in-progress': 'bg-green-600 text-white',
  completed: 'bg-[#1E2E29] text-[#EFE9DA]/40 line-through',
}

const statusLabels = {
  waiting: 'Waiting',
  called: 'Called',
  'in-progress': 'In Progress',
  completed: 'Done',
}

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueEntry[]>(mockQueue)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const waitingCount = queue.filter((e) => e.status === 'waiting').length
  const estimatedWait = waitingCount * 20 // 20 min per customer

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatWaitTime = (joinedAt: Date) => {
    const diff = Math.floor((currentTime.getTime() - joinedAt.getTime()) / 60000)
    if (diff < 1) return 'Just now'
    return `${diff}m ago`
  }

  return (
    <div className="min-h-screen bg-[#0F1B17] pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#EFE9DA] mb-2">
            Live Queue
          </h1>
          <p className="text-[#EFE9DA]/60">
            Real-time queue status • Updated every second
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-[#E8B547]">{waitingCount}</div>
              <div className="text-sm text-[#EFE9DA]/60">Waiting</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-500">{estimatedWait}m</div>
              <div className="text-sm text-[#EFE9DA]/60">Est. Wait</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-[#EFE9DA]">
                {queue.filter((e) => e.status === 'completed').length}
              </div>
              <div className="text-sm text-[#EFE9DA]/60">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-[#EFE9DA]">{formatTime(currentTime)}</div>
              <div className="text-sm text-[#EFE9DA]/60">Current Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Queue Display */}
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
            <div className="space-y-3">
              {queue.map((entry, index) => (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border transition-all duration-300',
                    entry.status === 'called'
                      ? 'border-[#E8B547] bg-[#E8B547]/10'
                      : 'border-[#2A3F3A]/50 bg-[#1E2E29]',
                    entry.status === 'completed' && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg',
                        statusColors[entry.status]
                      )}
                    >
                      {entry.ticketNumber}
                    </div>
                    <div>
                      <div className="font-medium text-[#EFE9DA]">{entry.name}</div>
                      <div className="text-sm text-[#EFE9DA]/60">{entry.service}</div>
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

            {/* Join Queue Button */}
            <div className="mt-6 pt-6 border-t border-[#2A3F3A]/50">
              <Button variant="primary" size="lg" className="w-full">
                Join Queue — Ticket #{queue.length > 0 ? Math.max(...queue.map((e) => e.ticketNumber)) + 1 : 1001}
              </Button>
              <p className="text-center text-sm text-[#EFE9DA]/40 mt-3">
                You&apos;ll be notified when it&apos;s your turn
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Queue Info */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent>
              <h3 className="font-semibold text-[#EFE9DA] mb-2">How it Works</h3>
              <ol className="text-sm text-[#EFE9DA]/60 space-y-2">
                <li>1. Tap &quot;Join Queue&quot; to get your ticket</li>
                <li>2. Wait comfortably — no standing in line</li>
                <li>3. Get notified when it&apos;s almost your turn</li>
                <li>4. Arrive when your ticket is called</li>
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="font-semibold text-[#EFE9DA] mb-2">Shop Hours</h3>
              <div className="text-sm text-[#EFE9DA]/60 space-y-1">
                <div className="flex justify-between">
                  <span>Mon - Fri</span>
                  <span>9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
