import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.N8N_API_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const shopId = searchParams.get("shopId")
    const date = searchParams.get("date")

    if (!shopId) {
      return NextResponse.json({ error: "shopId required" }, { status: 400 })
    }

    const services = await prisma.service.findMany({
      where: { businessId: shopId, isActive: true },
      orderBy: { price: "asc" },
    })

    const servicesList = services.map((s) => ({
      id: s.id,
      name: s.name,
      duration: s.duration,
      price: s.price,
      category: s.category,
    }))

    let bookedSlots: string[] = []
    if (date) {
      const dayStart = new Date(`${date}T00:00:00`)
      const dayEnd = new Date(`${date}T23:59:59`)

      const bookings = await prisma.booking.findMany({
        where: {
          businessId: shopId,
          scheduledAt: { gte: dayStart, lte: dayEnd },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: { scheduledAt: true, duration: true },
      })

      bookedSlots = bookings.map((b) => {
        const time = b.scheduledAt.toTimeString().slice(0, 5)
        return time
      })
    }

    const availableTimes = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    ].filter((t) => !bookedSlots.includes(t))

    return NextResponse.json({
      services: servicesList,
      availableTimes,
      bookedSlots,
      message: servicesList.length > 0
        ? `Available services: ${servicesList.map((s) => `${s.name} ($${s.price}, ${s.duration}min)`).join(", ")}`
        : "No services available at this shop yet",
    })
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
