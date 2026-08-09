import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const [
    totalUsers,
    totalBusinesses,
    totalBookings,
    totalQueueEntries,
    usersByRole,
    businessesByPlan,
    recentUsers,
    recentBusinesses,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.booking.count(),
    prisma.queueEntry.count(),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.business.groupBy({ by: ["plan"], _count: true }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.business.findMany({
      select: { id: true, name: true, plan: true, createdAt: true, template: { select: { name: true, icon: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return NextResponse.json({
    stats: {
      totalUsers,
      totalBusinesses,
      totalBookings,
      totalQueueEntries,
    },
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count })),
    businessesByPlan: businessesByPlan.map((p) => ({ plan: p.plan, count: p._count })),
    recentUsers,
    recentBusinesses,
  })
}
