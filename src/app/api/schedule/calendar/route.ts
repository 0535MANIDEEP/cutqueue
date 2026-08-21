import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth()))
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 })
    }

    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        scheduledAt: { gte: startDate, lte: endDate },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { scheduledAt: true, duration: true },
    })

    const slotsByDate = new Map<string, number>()

    for (const b of bookings) {
      const d = new Date(b.scheduledAt)
      const dateStr = d.toISOString().split("T")[0]
      slotsByDate.set(dateStr, (slotsByDate.get(dateStr) || 0) + 1)
    }

    const slots: { date: string; available: boolean; slots: { time: string; available: boolean }[] }[] = []
    const daysInMonth = endDate.getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split("T")[0]
      const bookingCount = slotsByDate.get(dateStr) || 0
      const maxSlotsPerDay = 20
      const available = bookingCount < maxSlotsPerDay

      const daySlots: { time: string; available: boolean }[] = []
      for (let h = 9; h <= 20; h++) {
        const hourKey = `${dateStr}-${h}`
        const hourBookings = bookings.filter((b) => {
          const bd = new Date(b.scheduledAt)
          return bd.toISOString().split("T")[0] === dateStr && bd.getHours() === h
        }).length
        daySlots.push({
          time: `${String(h).padStart(2, "0")}:00`,
          available: hourBookings < 3,
        })
      }

      slots.push({ date: dateStr, available, slots: daySlots })
    }

    return NextResponse.json(slots)
  } catch (error) {
    console.error("Calendar error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
