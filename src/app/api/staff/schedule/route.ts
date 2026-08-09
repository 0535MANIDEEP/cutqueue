import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const { staffId, isAvailable } = await req.json()

    if (!staffId || typeof isAvailable !== "boolean") {
      return NextResponse.json({ error: "staffId and isAvailable required" }, { status: 400 })
    }

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    })

    if (!staff || staff.businessId !== business.id) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 })
    }

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: { isAvailable },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
