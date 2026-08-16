import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get("businessId")
  const days = parseInt(searchParams.get("days") || "30")

  if (!businessId) {
    return NextResponse.json({ error: "Missing businessId" }, { status: 400 })
  }

  const since = new Date()
  since.setDate(since.getDate() - days)

  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      createdAt: { gte: since },
    },
    select: {
      scheduledAt: true,
      duration: true,
    },
  })

  const heatmap: { day: number; hour: number; count: number }[] = []

  for (let d = 0; d < 7; d++) {
    for (let h = 8; h < 20; h++) {
      heatmap.push({ day: d, hour: h, count: 0 })
    }
  }

  bookings.forEach((b) => {
    const date = new Date(b.scheduledAt)
    const day = date.getDay()
    const hour = date.getHours()
    const slot = heatmap.find((h) => h.day === day && h.hour === hour)
    if (slot) slot.count++
  })

  return NextResponse.json(heatmap)
}
