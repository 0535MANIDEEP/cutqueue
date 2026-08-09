import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serviceSchema } from "@/lib/validation"
import { logger } from "@/lib/logger"

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
    logger.error("Services GET error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
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
    const parsed = serviceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, description, duration, price, category } = parsed.data

    const service = await prisma.service.create({
      data: {
        businessId: business.id,
        name,
        description,
        duration,
        price,
        category,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    logger.error("Services POST error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
