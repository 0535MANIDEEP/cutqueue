import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const barberId = searchParams.get("barberId")

  const where = barberId ? { barberId } : {}

  const images = await prisma.portfolioImage.findMany({
    where,
    include: {
      barber: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(images)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.barberProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    return NextResponse.json({ error: "Barber profile not found" }, { status: 404 })
  }

  const { imageUrl, caption, category, tags } = await req.json()

  const image = await prisma.portfolioImage.create({
    data: {
      barberId: profile.id,
      imageUrl,
      caption,
      category: category || "fade",
      tags: tags || [],
    },
  })

  return NextResponse.json(image, { status: 201 })
}
