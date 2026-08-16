"use client"

import { useMemo } from "react"

interface HeatmapProps {
  data: { day: number; hour: number; count: number }[]
  maxCount?: number
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8)

function getIntensity(count: number, max: number): string {
  if (count === 0) return "bg-gray-50"
  const ratio = count / max
  if (ratio < 0.25) return "bg-emerald-100"
  if (ratio < 0.5) return "bg-emerald-200"
  if (ratio < 0.75) return "bg-emerald-400"
  return "bg-emerald-600"
}

function getTextColor(count: number, max: number): string {
  const ratio = count / max
  return ratio > 0.5 ? "text-white" : "text-gray-600"
}

export default function Heatmap({ data, maxCount }: HeatmapProps) {
  const max = useMemo(() => {
    if (maxCount) return maxCount
    return Math.max(...data.map((d) => d.count), 1)
  }, [data, maxCount])

  const grid = useMemo(() => {
    const g: Record<string, number> = {}
    data.forEach((d) => {
      g[`${d.day}-${d.hour}`] = d.count
    })
    return g
  }, [data])

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs text-gray-500 w-10" />
          {HOURS.map((h) => (
            <div key={h} className="flex-1 text-center text-xs text-gray-500">
              {h > 12 ? `${h - 12}p` : h === 12 ? "12p" : `${h}a`}
            </div>
          ))}
        </div>

        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex items-center gap-1 mb-1">
            <span className="text-xs text-gray-500 w-10 text-right pr-2">{day}</span>
            {HOURS.map((hour) => {
              const count = grid[`${dayIdx}-${hour}`] || 0
              return (
                <div
                  key={`${dayIdx}-${hour}`}
                  className={`flex-1 h-8 rounded-sm flex items-center justify-center text-xs font-medium cursor-default transition ${getIntensity(count, max)} ${getTextColor(count, max)}`}
                  title={`${day} ${hour > 12 ? hour - 12 : hour}:00 - ${count} bookings`}
                >
                  {count > 0 ? count : ""}
                </div>
              )
            })}
          </div>
        ))}

        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-xs text-gray-500">Less</span>
          {["bg-gray-50", "bg-emerald-100", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600"].map((color, i) => (
            <div key={i} className={`w-4 h-4 rounded-sm ${color}`} />
          ))}
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>
    </div>
  )
}
