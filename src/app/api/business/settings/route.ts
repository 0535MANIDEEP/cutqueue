import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "BUSINESS_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id! },
      include: {
        template: { select: { name: true, slug: true } },
        _count: { select: { staff: true, services: true, bookings: true } },
      },
    })

    if (!business) {
      return NextResponse.json({ error: "No business found" }, { status: 404 })
    }

    return NextResponse.json(business)
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "BUSINESS_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id! },
    })

    if (!business) {
      return NextResponse.json({ error: "No business found" }, { status: 404 })
    }

    const data = await req.json()

    const allowedFields = [
      "name", "description", "phone", "email", "address",
      "city", "state", "zipCode", "openingHours", "settings",
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
