import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 })
    }

    const staff = await prisma.staff.findMany({
      where: { businessId, isAvailable: true },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(
      staff.map((s) => ({
        id: s.id,
        name: s.user.name,
        image: s.user.image,
        rating: s.rating,
        specialties: s.specialties,
      }))
    )
  } catch (error) {
    logger.error("Staff GET error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
