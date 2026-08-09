import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")
    const staffId = searchParams.get("staffId")

    const where: Record<string, unknown> = {}
    if (businessId) where.businessId = businessId
    if (staffId) where.staffId = staffId

    const reviews = await prisma.review.findMany({
      where,
      include: {
        customer: { select: { name: true, image: true } },
        staff: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { businessId, staffId, rating, comment, bookingId } = await req.json()

    if (!businessId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating (1-5 required)" }, { status: 400 })
    }

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      })
      if (!booking || booking.customerId !== session.user.id) {
        return NextResponse.json({ error: "Invalid booking" }, { status: 400 })
      }
    }

    const review = await prisma.review.create({
      data: {
        customerId: session.user.id,
        businessId,
        staffId,
        rating: Math.round(rating),
        comment,
        isVerified: !!bookingId,
      },
    })

    if (staffId) {
      const staffReviews = await prisma.review.aggregate({
        where: { staffId },
        _avg: { rating: true },
        _count: { rating: true },
      })

      await prisma.staff.update({
        where: { id: staffId },
        data: {
          rating: staffReviews._avg.rating ?? 0,
          totalReviews: staffReviews._count.rating,
        },
      })
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
