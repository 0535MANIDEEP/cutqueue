import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 })
    }

    const now = new Date()
    const announcements = await prisma.announcement.findMany({
      where: {
        businessId,
        isActive: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "BUSINESS_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, type, startsAt, expiresAt } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 })
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: "No business found" }, { status: 404 })
    }

    const announcement = await prisma.announcement.create({
      data: {
        businessId: business.id,
        title,
        content,
        type: type || "GENERAL",
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "BUSINESS_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { announcementId } = await req.json()

    if (!announcementId) {
      return NextResponse.json({ error: "announcementId required" }, { status: 400 })
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    })

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    })

    if (!announcement || announcement.businessId !== business?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.announcement.delete({ where: { id: announcementId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
