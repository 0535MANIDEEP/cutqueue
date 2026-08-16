import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get("businessId")
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth()))
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

  if (!businessId) {
    return NextResponse.json({ error: "Missing businessId" }, { status: 400 })
  }

  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)

  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      scheduledAt: { gte: startDate, lte: endDate },
      status: { not: "CANCELLED" },
    },
    select: {
      scheduledAt: true,
      duration: true,
      status: true,
      service: { select: { name: true } },
      customer: { select: { name: true } },
    },
    orderBy: { scheduledAt: "asc" },
  })

  const daysInMonth = endDate.getDate()
  const calendarSlots: {
    date: string
    available: boolean
    slots: { time: string; available: boolean }[]
  }[] = []

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dateStr = date.toISOString().split("T")[0]
    const dayBookings = bookings.filter(
      (b) => b.scheduledAt.toISOString().split("T")[0] === dateStr
    )

    const allSlots: { time: string; available: boolean }[] = []
    for (let h = 9; h < 19; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        const isBooked = dayBookings.some((b) => {
          const bHour = b.scheduledAt.getHours()
          const bMin = b.scheduledAt.getMinutes()
          return bHour === h && bMin === m
        })
        allSlots.push({ time, available: !isBooked })
      }
    }

    calendarSlots.push({
      date: dateStr,
      available: allSlots.some((s) => s.available),
      slots: allSlots,
    })
  }

  return NextResponse.json(calendarSlots)
}
