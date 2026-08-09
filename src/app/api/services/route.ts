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

    const services = await prisma.service.findMany({
      where: { businessId, isActive: true },
      orderBy: { price: "asc" },
    })

    return NextResponse.json(services)
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

    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const { name, description, duration, price, category } = await req.json()

    const service = await prisma.service.create({
      data: {
        businessId: business.id,
        name,
        description,
        duration: duration || 30,
        price: price || 0,
        category: category || "general",
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
