import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")
    const days = parseInt(searchParams.get("days") || "30")

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 })
    }

    const since = new Date()
    since.setDate(since.getDate() - days)

    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        createdAt: { gte: since },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      select: { scheduledAt: true },
    })

    const heatmap: { day: number; hour: number; count: number }[] = []
    const counts = new Map<string, number>()

    for (const b of bookings) {
      const d = new Date(b.scheduledAt)
      const day = d.getDay()
      const hour = d.getHours()
      const key = `${day}-${hour}`
      counts.set(key, (counts.get(key) || 0) + 1)
    }

    for (const [key, count] of counts) {
      const [day, hour] = key.split("-").map(Number)
      heatmap.push({ day, hour, count })
    }

    return NextResponse.json(heatmap)
  } catch (error) {
    console.error("Heatmap error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
