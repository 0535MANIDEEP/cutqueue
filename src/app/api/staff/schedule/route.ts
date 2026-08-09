import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { staffScheduleSchema } from "@/lib/validation"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "BUSINESS_OWNER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const staff = await prisma.staff.findMany({
      where: { businessId: business.id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(staff)
  } catch (error) {
    logger.error("Staff schedule GET error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "BUSINESS_OWNER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = staffScheduleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { staffId, isAvailable } = body

    if (!staffId) {
      return NextResponse.json({ error: "staffId required" }, { status: 400 })
    }

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    })

    if (!staff || staff.businessId !== business.id) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 })
    }

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: { isAvailable: parsed.data.isAvailable },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error("Staff schedule PATCH error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
