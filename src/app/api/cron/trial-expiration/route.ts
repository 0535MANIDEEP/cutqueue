import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()

    const expiredBusinesses = await prisma.business.findMany({
      where: {
        plan: { not: "FREE" },
        planExpiresAt: { lt: now },
      },
      select: { id: true, name: true, plan: true, ownerId: true },
    })

    for (const business of expiredBusinesses) {
      await prisma.business.update({
        where: { id: business.id },
        data: {
          plan: "FREE",
          planExpiresAt: null,
        },
      })

      await prisma.notification.create({
        data: {
          userId: business.ownerId,
          type: "SYSTEM",
          title: "Subscription Expired",
          message: `Your ${business.plan} plan has expired. Your account has been reverted to the Free plan. Please upgrade to continue using premium features.`,
          data: { businessId: business.id },
        },
      })

      logger.info("Subscription expired, reverted to FREE", { businessId: business.id })
    }

    const trialExpiring = await prisma.business.findMany({
      where: {
        plan: "FREE",
        planExpiresAt: {
          not: null,
          lt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          gt: now,
        },
      },
      select: { id: true, name: true, ownerId: true, planExpiresAt: true },
    })

    for (const business of trialExpiring) {
      const daysLeft = Math.ceil(
        (business.planExpiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      await prisma.notification.create({
        data: {
          userId: business.ownerId,
          type: "SYSTEM",
          title: "Trial Expiring Soon",
          message: `Your free trial expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Upgrade to keep your premium features.`,
          data: { businessId: business.id },
        },
      })
    }

    return NextResponse.json({
      expired: expiredBusinesses.length,
      expiring: trialExpiring.length,
    })
  } catch (error) {
    logger.error("Trial expiration cron failed", {}, error as Error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}
