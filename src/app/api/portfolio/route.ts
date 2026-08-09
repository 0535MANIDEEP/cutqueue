import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const staffId = searchParams.get("staffId")

    const where = staffId ? { staffId } : {}

    const images = await prisma.portfolioImage.findMany({
      where,
      include: {
        staff: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.staff.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: "Staff profile not found" }, { status: 404 })
    }

    const { imageUrl, caption, category, tags } = await req.json()

    const image = await prisma.portfolioImage.create({
      data: {
        staffId: profile.id,
        imageUrl,
        caption,
        category: category || "general",
        tags: tags || [],
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
