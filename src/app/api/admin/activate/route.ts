import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shopSlug, plan } = await request.json()

    if (!shopSlug || !plan) {
      return NextResponse.json({ error: "Missing shopSlug or plan" }, { status: 400 })
    }

    const validPlans = ["FREE", "STARTER", "PRO", "BUSINESS"]
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const business = await prisma.business.findUnique({
      where: { slug: shopSlug },
      select: { id: true, name: true, plan: true },
    })

    if (!business) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    await prisma.business.update({
      where: { id: business.id },
      data: {
        plan: plan as any,
        planExpiresAt: plan === "FREE" ? null : expiresAt,
      },
    })

    await prisma.notification.create({
      data: {
        userId: business.id,
        type: "SYSTEM",
        title: "Plan Activated",
        message: `Your ${plan} plan has been activated! Expires on ${expiresAt.toLocaleDateString("en-IN")}`,
        data: { businessId: business.id, plan },
      },
    })

    return NextResponse.json({
      success: true,
      message: `${business.name} activated to ${plan} plan`,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Activate error:", error)
    return NextResponse.json({ error: "Failed to activate" }, { status: 500 })
  }
}
