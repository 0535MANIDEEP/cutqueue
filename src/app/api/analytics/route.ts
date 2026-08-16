import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    if (!business) {
      return NextResponse.json({ error: "No business found" }, { status: 404 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
      totalBookings,
      bookingsLast30Days,
      bookingsThisMonth,
      bookingsLastMonth,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      totalCustomers,
      newCustomersThisMonth,
      averageRating,
      totalReviews,
      topServices,
      bookingsByDay,
      recentBookings,
      queueStats,
      activeQueueEntries,
    ] = await Promise.all([
      prisma.booking.count({ where: { businessId: business.id } }),
      prisma.booking.count({
        where: { businessId: business.id, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.booking.count({
        where: { businessId: business.id, createdAt: { gte: startOfMonth } },
      }),
      prisma.booking.count({
        where: {
          businessId: business.id,
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
      }),
      prisma.booking.count({
        where: { businessId: business.id, status: "COMPLETED" },
      }),
      prisma.booking.count({
        where: { businessId: business.id, status: "CANCELLED" },
      }),
      prisma.booking.aggregate({
        where: { businessId: business.id, status: "COMPLETED" },
        _sum: { duration: true },
      }),
      prisma.booking.aggregate({
        where: {
          businessId: business.id,
          status: "COMPLETED",
          createdAt: { gte: startOfMonth },
        },
        _sum: { duration: true },
      }),
      prisma.booking.aggregate({
        where: {
          businessId: business.id,
          status: "COMPLETED",
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
        _sum: { duration: true },
      }),
      prisma.booking.findMany({
        where: { businessId: business.id },
        select: { customerId: true },
        distinct: ["customerId"],
      }),
      prisma.booking.findMany({
        where: {
          businessId: business.id,
          createdAt: { gte: startOfMonth },
        },
        select: { customerId: true },
        distinct: ["customerId"],
      }),
      prisma.review.aggregate({
        where: { businessId: business.id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.review.count({ where: { businessId: business.id } }),
      prisma.booking.groupBy({
        by: ["serviceId"],
        where: { businessId: business.id, status: "COMPLETED" },
        _count: { id: true },
        _sum: { duration: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      prisma.booking.findMany({
        where: {
          businessId: business.id,
          createdAt: { gte: sevenDaysAgo },
        },
        select: {
          createdAt: true,
          status: true,
        },
      }),
      prisma.booking.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          createdAt: true,
          service: { select: { name: true, price: true } },
          customer: { select: { name: true, email: true } },
        },
      }),
      prisma.queue.findFirst({
        where: { businessId: business.id },
        select: { id: true, currentNumber: true, estimatedWait: true },
      }),
      prisma.queueEntry.count({
        where: {
          queue: { businessId: business.id },
          status: { in: ["WAITING", "CALLED"] },
        },
      }),
    ])

    const serviceNames = await prisma.service.findMany({
      where: { businessId: business.id },
      select: { id: true, name: true, price: true },
    })

    const serviceNameMap = new Map(serviceNames.map((s) => [s.id, s]))

    const topServicesWithNames = topServices.map((s) => ({
      ...s,
      name: serviceNameMap.get(s.serviceId)?.name || "Unknown",
      price: serviceNameMap.get(s.serviceId)?.price || 0,
    }))

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const bookingsByDayOfWeek = dayLabels.map((day, index) => ({
      day,
      count: bookingsByDay.filter((b) => b.createdAt.getDay() === index).length,
    }))

    const bookingTrend = bookingsByDay.reduce(
      (acc, b) => {
        const key = b.createdAt.toISOString().split("T")[0]
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const revenueMonthlyDelta =
      (revenueThisMonth._sum.duration || 0) > 0 && (revenueLastMonth._sum.duration || 0) > 0
        ? (((revenueThisMonth._sum.duration || 0) - (revenueLastMonth._sum.duration || 0)) /
            (revenueLastMonth._sum.duration || 1)) *
          100
        : 0

    const bookingMonthlyDelta =
      bookingsLastMonth > 0
        ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
        : 0

    return NextResponse.json({
      overview: {
        totalBookings,
        bookingsLast30Days,
        completedBookings,
        cancelledBookings,
        completionRate:
          totalBookings > 0
            ? Math.round((completedBookings / totalBookings) * 100)
            : 0,
        cancellationRate:
          totalBookings > 0
            ? Math.round((cancelledBookings / totalBookings) * 100)
            : 0,
        totalCustomers: totalCustomers.length,
        newCustomersThisMonth: newCustomersThisMonth.length,
        averageRating: averageRating._avg.rating || 0,
        totalReviews,
      },
      revenue: {
        thisMonth: revenueThisMonth._sum.duration || 0,
        lastMonth: revenueLastMonth._sum.duration || 0,
        monthlyDelta: Math.round(revenueMonthlyDelta * 10) / 10,
      },
      bookings: {
        thisMonth: bookingsThisMonth,
        lastMonth: bookingsLastMonth,
        monthlyDelta: Math.round(bookingMonthlyDelta * 10) / 10,
        byDayOfWeek: bookingsByDayOfWeek,
        trend: bookingTrend,
      },
      topServices: topServicesWithNames,
      recentBookings,
      queue: {
        currentNumber: queueStats?.currentNumber || 0,
        estimatedWait: queueStats?.estimatedWait || 0,
        activeEntries: activeQueueEntries,
      },
    })
  } catch (error) {
    logger.error("Failed to fetch analytics", {}, error as Error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
