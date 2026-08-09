import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const shopId = searchParams.get("shopId")

  if (!shopId) {
    return NextResponse.json({ error: "shopId required" }, { status: 400 })
  }

  const services = await prisma.service.findMany({
    where: { shopId, isActive: true },
    orderBy: { price: "asc" },
  })

  return NextResponse.json(services)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const shop = await prisma.barberShop.findUnique({
    where: { ownerId: session.user.id },
  })

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 })
  }

  const { name, description, duration, price, category } = await req.json()

  const service = await prisma.service.create({
    data: {
      shopId: shop.id,
      name,
      description,
      duration: duration || 30,
      price: price || 0,
      category: category || "haircut",
    },
  })

  return NextResponse.json(service, { status: 201 })
}
