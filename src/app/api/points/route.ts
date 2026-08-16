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

    const points = await prisma.customerPoints.findUnique({
      where: { customerId: session.user.id },
      include: {
        rewards: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    })

    if (!points) {
      return NextResponse.json({
        points: 0,
        tier: "BRONZE",
        totalVisits: 0,
        totalSpent: 0,
        streakDays: 0,
        rewards: [],
      })
    }

    return NextResponse.json(points)
  } catch (error) {
    logger.error("Failed to fetch points", {}, error as Error)
    return NextResponse.json({ error: "Failed to fetch points" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, bookingId, businessId, amount } = body

    if (!action || !businessId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let pointsToAward = 0
    let type = "VISIT"

    switch (action) {
      case "visit":
        pointsToAward = 10
        type = "VISIT"
        break
      case "booking":
        pointsToAward = 5
        type = "BOOKING"
        break
      case "review":
        pointsToAward = 15
        type = "REVIEW"
        break
      case "referral":
        pointsToAward = 50
        type = "REFERRAL"
        break
      case "spend":
        pointsToAward = Math.floor((amount || 0) / 1)
        type = "SPEND"
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updated = await prisma.customerPoints.upsert({
      where: { customerId: session.user.id },
      create: {
        customerId: session.user.id,
        points: pointsToAward,
        totalVisits: action === "visit" ? 1 : 0,
        totalSpent: action === "spend" ? (amount || 0) : 0,
        tier: "BRONZE",
      },
      update: {
        points: { increment: pointsToAward },
        totalVisits: action === "visit" ? { increment: 1 } : undefined,
        totalSpent: action === "spend" ? { increment: amount || 0 } : undefined,
        lastVisitAt: action === "visit" ? new Date() : undefined,
      },
    })

    const newTier = calculateTier(updated.points)
    if (newTier !== updated.tier) {
      await prisma.customerPoints.update({
        where: { customerId: session.user.id },
        data: { tier: newTier },
      })
    }

    return NextResponse.json({
      awarded: pointsToAward,
      type,
      totalPoints: updated.points + pointsToAward,
      tier: newTier,
    })
  } catch (error) {
    logger.error("Failed to award points", {}, error as Error)
    return NextResponse.json({ error: "Failed to award points" }, { status: 500 })
  }
}

function calculateTier(points: number): "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" {
  if (points >= 1000) return "PLATINUM"
  if (points >= 500) return "GOLD"
  if (points >= 200) return "SILVER"
  return "BRONZE"
}
