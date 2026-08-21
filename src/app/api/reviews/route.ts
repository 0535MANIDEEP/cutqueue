import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { reviewSchema } from "@/lib/validation"
import { logger } from "@/lib/logger"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 })
    }

    const reviews = await prisma.review.findMany({
      where: { businessId },
      include: {
        customer: { select: { name: true } },
        staff: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
      distribution: [1, 2, 3, 4, 5].map((star) => ({
        stars: star,
        count: reviews.filter((r) => r.rating === star).length,
      })),
    })
  } catch (error) {
    logger.error("Reviews GET error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { businessId, staffId, rating, comment } = parsed.data

    // Check if already reviewed this business (unique constraint)
    const existingReview = await prisma.review.findFirst({
      where: { customerId: session.user.id, businessId },
    })
    if (existingReview) {
      return NextResponse.json({ error: "You already reviewed this business" }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        customerId: session.user.id,
        businessId,
        staffId: staffId || undefined,
        rating,
        comment,
      },
    })

    // Update staff rating if applicable
    if (staffId) {
      const staffReviews = await prisma.review.findMany({
        where: { staffId },
        select: { rating: true },
      })
      const staffAvg = staffReviews.reduce((sum, r) => sum + r.rating, 0) / staffReviews.length
      await prisma.staff.update({
        where: { id: staffId },
        data: { rating: staffAvg, totalReviews: staffReviews.length },
      })
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    logger.error("Reviews POST error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
