import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "BUSINESS_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Revenue this month
    const thisMonthBookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        status: "COMPLETED",
        createdAt: { gte: thisMonthStart },
      },
      include: { service: { select: { price: true, name: true } } },
    })

    // Revenue last month
    const lastMonthBookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        status: "COMPLETED",
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      include: { service: { select: { price: true, name: true } } },
    })

    const thisMonthRevenue = thisMonthBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0)
    const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0)

    // Today's stats
    const todayBookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        scheduledAt: { gte: today, lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      },
      include: { service: { select: { price: true } } },
    })

    const todayRevenue = todayBookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + (b.service?.price || 0), 0)

    const todayCompleted = todayBookings.filter((b) => b.status === "COMPLETED").length
    const todayNoShows = todayBookings.filter((b) => b.status === "NO_SHOW").length
    const todayCancelled = todayBookings.filter((b) => b.status === "CANCELLED").length

    // Top services
    const serviceStats = new Map<string, { name: string; count: number; revenue: number }>()
    for (const b of thisMonthBookings) {
      const sName = "Service"
      const existing = serviceStats.get(b.serviceId) || { name: sName, count: 0, revenue: 0 }
      existing.count++
      existing.revenue += b.service?.price || 0
      serviceStats.set(b.serviceId, existing)
    }

    // Fetch actual service names
    const serviceIds = Array.from(serviceStats.keys())
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true },
    })
    const serviceNameMap = new Map(services.map((s) => [s.id, s.name]))

    const topServices = Array.from(serviceStats.entries())
      .map(([id, stats]) => ({ ...stats, name: serviceNameMap.get(id) || stats.name }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Staff performance
    const staffBookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        status: "COMPLETED",
        createdAt: { gte: thisMonthStart },
      },
      include: {
        staff: { include: { user: { select: { name: true } } } },
        service: { select: { price: true } },
      },
    })

    const staffStats = new Map<string, { name: string; bookings: number; revenue: number }>()
    for (const b of staffBookings) {
      if (!b.staffId) continue
      const existing = staffStats.get(b.staffId) || { name: b.staff?.user?.name || "Staff", bookings: 0, revenue: 0 }
      existing.bookings++
      existing.revenue += b.service?.price || 0
      staffStats.set(b.staffId, existing)
    }

    const topStaff = Array.from(staffStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Queue stats
    const queue = await prisma.queue.findFirst({ where: { businessId: business.id } })
    let avgWaitTime = 0
    let totalServedToday = 0
    if (queue) {
      const todayEntries = await prisma.queueEntry.findMany({
        where: {
          queueId: queue.id,
          joinedAt: { gte: today },
        },
      })
      totalServedToday = todayEntries.filter((e) => e.status === "COMPLETED").length
      const completedEntries = todayEntries.filter((e) => e.status === "COMPLETED" && e.startedAt && e.completedAt)
      if (completedEntries.length > 0) {
        const totalWait = completedEntries.reduce((sum, e) => {
          return sum + (new Date(e.completedAt!).getTime() - new Date(e.joinedAt).getTime())
        }, 0)
        avgWaitTime = Math.round(totalWait / completedEntries.length / 60000)
      }
    }

    // Customer stats
    const totalCustomers = await prisma.user.count({
      where: { role: "CUSTOMER" },
    })

    const newCustomersThisMonth = await prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: thisMonthStart },
      },
    })

    // No-show rate
    const totalBookingsThisMonth = await prisma.booking.count({
      where: {
        businessId: business.id,
        createdAt: { gte: thisMonthStart },
      },
    })
    const noShowsThisMonth = await prisma.booking.count({
      where: {
        businessId: business.id,
        status: "NO_SHOW",
        createdAt: { gte: thisMonthStart },
      },
    })
    const noShowRate = totalBookingsThisMonth > 0
      ? Math.round((noShowsThisMonth / totalBookingsThisMonth) * 100)
      : 0

    // Revenue trend (last 7 days)
    const revenueTrend: { date: string; revenue: number; bookings: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today)
      dayStart.setDate(dayStart.getDate() - i)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayBookings = await prisma.booking.findMany({
        where: {
          businessId: business.id,
          status: "COMPLETED",
          scheduledAt: { gte: dayStart, lt: dayEnd },
        },
        include: { service: { select: { price: true } } },
      })

      revenueTrend.push({
        date: dayStart.toISOString().split("T")[0],
        revenue: dayBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0),
        bookings: dayBookings.length,
      })
    }

    return NextResponse.json({
      revenue: {
        today: todayRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        trend: revenueTrend,
      },
      bookings: {
        today: todayBookings.length,
        completed: todayCompleted,
        noShows: todayNoShows,
        cancelled: todayCancelled,
        noShowRate,
      },
      queue: {
        avgWaitTime,
        servedToday: totalServedToday,
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
      },
      topServices,
      topStaff,
    })
  } catch (error) {
    logger.error("Analytics GET error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
