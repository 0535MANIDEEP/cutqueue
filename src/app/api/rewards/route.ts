import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

const REWARD_OPTIONS = [
  { name: "10% Off Next Visit", description: "Get 10% off your next service", pointsCost: 100, type: "DISCOUNT" },
  { name: "Free Haircut", description: "One free standard haircut", pointsCost: 300, type: "FREE_SERVICE" },
  { name: "Priority Booking", description: "Skip the queue for your next 3 bookings", pointsCost: 200, type: "PRIORITY_BOOKING" },
  { name: "Free Beard Trim", description: "One free beard trim service", pointsCost: 150, type: "FREE_SERVICE" },
  { name: "VIP Access", description: "Exclusive access to new services for 1 month", pointsCost: 500, type: "EXCLUSIVE_ACCESS" },
]

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const points = await prisma.customerPoints.findUnique({
      where: { customerId: session.user.id },
      select: { points: true },
    })

    const availableRewards = REWARD_OPTIONS.map((reward) => ({
      ...reward,
      canRedeem: (points?.points ?? 0) >= reward.pointsCost,
    }))

    const redeemedRewards = await prisma.reward.findMany({
      where: {
        points: { customerId: session.user.id },
        isRedeemed: true,
      },
      orderBy: { redeemedAt: "desc" },
      take: 20,
    })

    return NextResponse.json({
      available: availableRewards,
      redeemed: redeemedRewards,
      currentPoints: points?.points ?? 0,
    })
  } catch (error) {
    logger.error("Failed to fetch rewards", {}, error as Error)
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { rewardName } = body

    const rewardOption = REWARD_OPTIONS.find((r) => r.name === rewardName)
    if (!rewardOption) {
      return NextResponse.json({ error: "Invalid reward" }, { status: 400 })
    }

    const points = await prisma.customerPoints.findUnique({
      where: { customerId: session.user.id },
    })

    if (!points || points.points < rewardOption.pointsCost) {
      return NextResponse.json({ error: "Not enough points" }, { status: 400 })
    }

    const [updatedPoints, reward] = await prisma.$transaction([
      prisma.customerPoints.update({
        where: { customerId: session.user.id },
        data: { points: { decrement: rewardOption.pointsCost } },
      }),
      prisma.reward.create({
        data: {
          pointsId: points.id,
          name: rewardOption.name,
          description: rewardOption.description,
          pointsCost: rewardOption.pointsCost,
          type: rewardOption.type as any,
          isRedeemed: true,
          redeemedAt: new Date(),
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      reward: reward.name,
      pointsSpent: rewardOption.pointsCost,
      remainingPoints: updatedPoints.points,
    })
  } catch (error) {
    logger.error("Failed to redeem reward", {}, error as Error)
    return NextResponse.json({ error: "Failed to redeem reward" }, { status: 500 })
  }
}
