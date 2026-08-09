'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

const typeIcons: Record<string, string> = {
  BOOKING_CONFIRMED: '📅',
  BOOKING_REMINDER: '⏰',
  BOOKING_CANCELLED: '❌',
  QUEUE_UPDATE: '📋',
  QUEUE_YOUR_TURN: '🎯',
  REWARD_EARNED: '🎁',
  REFERRAL_COMPLETE: '👥',
  PROMOTIONAL: '🎉',
  SYSTEM: '⚙️',
  COMPLAINT_UPDATE: '📝',
  ANNOUNCEMENT: '📢',
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (e) {
      console.error(e)
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1B17] pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#EFE9DA]">Notifications</h1>
            <p className="text-[#EFE9DA]/50 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#EFE9DA]/50">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#EFE9DA]/60">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (!notification.isRead) markAsRead(notification.id)
                  }
                }}
                className={cn(
                  'rounded-lg border transition-colors cursor-pointer',
                  !notification.isRead
                    ? 'border-[#E8B547]/30 bg-[#E8B547]/5'
                    : 'border-[#2A3F3A]/50 bg-[#1E2E29]'
                )}
              >
                <div className="p-4 flex items-start gap-3">
                  <span className="text-xl mt-0.5">
                    {typeIcons[notification.type] || '📋'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        'text-sm font-medium',
                        notification.isRead ? 'text-[#EFE9DA]/70' : 'text-[#EFE9DA]'
                      )}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#E8B547]" />
                      )}
                    </div>
                    <p className="text-sm text-[#EFE9DA]/50 mt-0.5">{notification.message}</p>
                    <p className="text-xs text-[#EFE9DA]/30 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
