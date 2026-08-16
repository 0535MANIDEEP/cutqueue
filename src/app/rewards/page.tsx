"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"

interface PointsData {
  points: number
  tier: string
  totalVisits: number
  totalSpent: number
  streakDays: number
  lastVisitAt: string | null
  rewards: { name: string; pointsCost: number; redeemedAt: string | null }[]
}

interface RewardsData {
  available: { name: string; description: string; pointsCost: number; type: string; canRedeem: boolean }[]
  redeemed: { name: string; pointsCost: number; redeemedAt: string | null }[]
  currentPoints: number
}

const TIER_COLORS: Record<string, string> = {
  BRONZE: "from-amber-600 to-amber-800",
  SILVER: "from-gray-400 to-gray-600",
  GOLD: "from-yellow-400 to-yellow-600",
  PLATINUM: "from-purple-400 to-indigo-600",
}

const TIER_LABELS: Record<string, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
}

const TIER_THRESHOLDS = [
  { tier: "SILVER", min: 200 },
  { tier: "GOLD", min: 500 },
  { tier: "PLATINUM", min: 1000 },
]

export default function RewardsPage() {
  const [points, setPoints] = useState<PointsData | null>(null)
  const [rewards, setRewards] = useState<RewardsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/points").then((r) => r.json()),
      fetch("/api/rewards").then((r) => r.json()),
    ])
      .then(([p, r]) => {
        setPoints(p)
        setRewards(r)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleRedeem = async (rewardName: string) => {
    setRedeeming(rewardName)
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardName }),
      })
      const data = await res.json()
      if (data.success) {
        setRewards((prev) =>
          prev
            ? { ...prev, currentPoints: data.remainingPoints }
            : prev
        )
        setPoints((prev) =>
          prev ? { ...prev, points: data.remainingPoints } : prev
        )
      }
    } catch (error) {
      console.error("Redeem failed:", error)
    }
    setRedeeming(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-40 bg-gray-200 rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentPoints = points?.points ?? 0
  const currentTier = points?.tier ?? "BRONZE"
  const nextTier = TIER_THRESHOLDS.find((t) => t.min > currentPoints)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Rewards</h1>

        <div className={`bg-gradient-to-r ${TIER_COLORS[currentTier]} rounded-2xl p-8 text-white mb-8`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/80 text-sm">Current Tier</p>
              <p className="text-3xl font-bold">{TIER_LABELS[currentTier]}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Available Points</p>
              <p className="text-4xl font-bold">{currentPoints}</p>
            </div>
          </div>

          {nextTier && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{TIER_LABELS[currentTier]}</span>
                <span>{TIER_LABELS[nextTier.tier]} ({nextTier.min} pts)</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all"
                  style={{
                    width: `${Math.min(100, (currentPoints / nextTier.min) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-sm text-white/70 mt-1">
                {nextTier.min - currentPoints} more points to {TIER_LABELS[nextTier.tier]}
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{points?.totalVisits ?? 0}</p>
              <p className="text-sm text-white/70">Total Visits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{points?.streakDays ?? 0}</p>
              <p className="text-sm text-white/70">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{points?.rewards?.length ?? 0}</p>
              <p className="text-sm text-white/70">Rewards Earned</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {rewards?.available.map((reward) => (
            <div key={reward.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                  <p className="text-sm font-medium text-blue-600 mt-2">{reward.pointsCost} points</p>
                </div>
                <button
                  onClick={() => handleRedeem(reward.name)}
                  disabled={!reward.canRedeem || redeeming === reward.name}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    reward.canRedeem
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {redeeming === reward.name ? "Redeeming..." : reward.canRedeem ? "Redeem" : "Not enough pts"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {rewards?.redeemed && rewards.redeemed.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Redeemed Rewards</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
              {rewards.redeemed.map((r, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-sm text-gray-500">
                      Redeemed {r.redeemedAt ? new Date(r.redeemedAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-500">{r.pointsCost} pts</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
