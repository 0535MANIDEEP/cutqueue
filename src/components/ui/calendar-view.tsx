"use client"

import { useState, useMemo } from "react"

interface CalendarSlot {
  date: string
  available: boolean
  slots: { time: string; available: boolean }[]
}

interface CalendarViewProps {
  slots: CalendarSlot[]
  selectedDate: string | null
  selectedTime: string | null
  onSelect: (date: string, time: string) => void
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function CalendarView({ slots, selectedDate, selectedTime, onSelect }: CalendarViewProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const slotMap = useMemo(() => {
    const map: Record<string, CalendarSlot> = {}
    slots.forEach((s) => { map[s.date] = s })
    return map
  }, [slots])

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const formatDate = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const selectedSlot = selectedDate ? slotMap[selectedDate] : null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-gray-900">{MONTHS[currentMonth]} {currentYear}</h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = formatDate(day)
          const slot = slotMap[dateStr]
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
          const isSelected = dateStr === selectedDate
          const isPast = new Date(dateStr) < new Date(today.toISOString().split("T")[0])
          const hasSlots = slot?.slots.some((s) => s.available)

          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => {
                if (hasSlots && !isPast) {
                  const firstAvailable = slot.slots.find((s) => s.available)
                  if (firstAvailable) onSelect(dateStr, firstAvailable.time)
                }
              }}
              className={`relative h-10 rounded-lg text-sm font-medium transition
                ${isPast ? "text-gray-300 cursor-not-allowed" : ""}
                ${isSelected ? "bg-blue-600 text-white" : ""}
                ${isToday && !isSelected ? "ring-2 ring-blue-400" : ""}
                ${!isPast && !isSelected && hasSlots ? "hover:bg-blue-50 text-gray-900" : ""}
                ${!isPast && !isSelected && !hasSlots ? "text-gray-400" : ""}
              `}
            >
              {day}
              {!isPast && hasSlots && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {selectedSlot && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Available times for {selectedDate}</p>
          <div className="grid grid-cols-4 gap-2">
            {selectedSlot.slots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => selectedDate && onSelect(selectedDate, slot.time)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition
                  ${!slot.available ? "bg-gray-50 text-gray-300 cursor-not-allowed" : ""}
                  ${slot.available && selectedTime === slot.time ? "bg-blue-600 text-white" : ""}
                  ${slot.available && selectedTime !== slot.time ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : ""}
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
