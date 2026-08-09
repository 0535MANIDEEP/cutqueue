'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TrialData {
  isActive: boolean
  daysRemaining: number
  daysUsed: number
  expiresAt: string
  warnings: string[]
  usage: {
    bookingsThisMonth: number
    staffCount: number
    servicesCount: number
  }
}

export function TrialBanner() {
  const [trial, setTrial] = useState<TrialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/trial')
      .then((res) => res.json())
      .then((data) => {
        if (data.type === 'business') {
          setTrial(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !trial || dismissed || trial.daysRemaining > 30) return null

  const isUrgent = trial.daysRemaining <= 7
  const isWarning = trial.daysRemaining <= 14

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg mb-6 flex items-center justify-between',
        isUrgent
          ? 'bg-red-500/10 border border-red-500/30'
          : isWarning
          ? 'bg-[#E8B547]/10 border border-[#E8B547]/30'
          : 'bg-blue-500/10 border border-blue-500/30'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-2 h-2 rounded-full',
          isUrgent ? 'bg-red-500 animate-pulse' : isWarning ? 'bg-[#E8B547]' : 'bg-blue-500'
        )} />
        <div>
          <span className={cn(
            'font-medium',
            isUrgent ? 'text-red-400' : isWarning ? 'text-[#E8B547]' : 'text-blue-400'
          )}>
            {trial.daysRemaining <= 0
              ? 'Trial Expired'
              : `${trial.daysRemaining} days left in free trial`}
          </span>
          <span className="text-[#EFE9DA]/50 ml-2">
            ({trial.usage.bookingsThisMonth} bookings this month)
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/#pricing"
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            isUrgent
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-[#E8B547] text-[#0F1B17] hover:bg-[#E8B547]/90'
          )}
        >
          Choose Plan
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#EFE9DA]/40 hover:text-[#EFE9DA]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
