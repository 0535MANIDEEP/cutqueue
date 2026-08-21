import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTrialConfig, getTrialWarnings, PRICING_TIERS, getBusinessPlanStatus } from "@/lib/trial"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role === "ADMIN") {
      const totalBusinesses = await prisma.business.count()
      const activeBusinesses = await prisma.business.count({ where: { isActive: true } })
      const totalBookings = await prisma.booking.count()
      const totalUsers = await prisma.user.count()

      return NextResponse.json({
        type: "admin",
        stats: {
          totalBusinesses,
          activeBusinesses,
          totalBookings,
          totalUsers,
        },
        pricing: PRICING_TIERS,
      })
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({
        type: "customer",
        message: "No business found. Create one to start your free trial.",
      })
    }

    const planStatus = await getBusinessPlanStatus(business.id)
    if (!planStatus) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const config = getTrialConfig(business.plan)
    const now = new Date()

    const bookingsThisMonth = await prisma.booking.count({
      where: {
        businessId: business.id,
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    })

    const staffCount = await prisma.staff.count({
      where: { businessId: business.id },
    })

    const servicesCount = await prisma.service.count({
      where: { businessId: business.id },
    })

    const usage = {
      smsSent: 0,
      emailsSent: 0,
      bookingsThisMonth,
      staffCount,
      servicesCount,
    }

    const warnings = planStatus.expiresAt
      ? getTrialWarnings(planStatus.expiresAt)
      : planStatus.plan === "FREE"
        ? ["Trial expired. Choose a plan to continue."]
        : []

    return NextResponse.json({
      type: "business",
      isActive: planStatus.isActive,
      daysRemaining: planStatus.daysRemaining,
      expiresAt: planStatus.expiresAt,
      usage,
      limits: {
        allowed: true,
        config,
      },
      warnings,
      pricing: PRICING_TIERS,
      business: {
        id: business.id,
        name: business.name,
        plan: business.plan,
      },
    })
  } catch (error) {
    console.error("Trial route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
