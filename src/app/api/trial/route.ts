import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTrialConfig, checkTrialLimits, getTrialWarnings, PRICING_TIERS, REVENUE_PROJECTION } from "@/lib/trial"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const config = getTrialConfig()

    if (session.user.role === "ADMIN") {
      const totalBusinesses = await prisma.business.count()
      const activeBusinesses = await prisma.business.count({ where: { isActive: true } })
      const totalBookings = await prisma.booking.count()
      const totalUsers = await prisma.user.count()

      return NextResponse.json({
        type: "admin",
        config,
        stats: {
          totalBusinesses,
          activeBusinesses,
          totalBookings,
          totalUsers,
        },
        pricing: PRICING_TIERS,
        projection: REVENUE_PROJECTION,
      })
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id! },
    })

    if (!business) {
      return NextResponse.json({
        type: "customer",
        config,
        message: "No business found. Create one to start your free trial.",
      })
    }

    const now = new Date()
    const trialStart = business.createdAt
    const trialEnd = new Date(trialStart.getTime() + config.trialDays * 24 * 60 * 60 * 1000)
    const daysUsed = Math.ceil((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const isTrialActive = now < trialEnd

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

    const limits = checkTrialLimits(usage)
    const warnings = isTrialActive ? getTrialWarnings(trialEnd) : ["Trial expired. Choose a plan to continue."]

    return NextResponse.json({
      type: "business",
      isActive: isTrialActive,
      daysRemaining,
      daysUsed,
      expiresAt: trialEnd,
      usage,
      limits,
      warnings,
      config,
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
