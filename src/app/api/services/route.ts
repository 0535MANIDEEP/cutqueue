import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serviceSchema } from "@/lib/validation"
import { logger } from "@/lib/logger"
import { enforceServiceLimits } from "@/lib/trial-enforcement"
import { requirePermission, Role } from "@/lib/roles"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")

    if (businessId) {
      const services = await prisma.service.findMany({
        where: { businessId, isActive: true },
        orderBy: { price: "asc" },
      })
      return NextResponse.json(services)
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const permCheck = await requirePermission(session as { user: { role: Role; id: string } }, "service:read")
    if (!permCheck.allowed) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.error === "Unauthorized" ? 401 : 403 })
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const services = await prisma.service.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
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

    const permCheck = await requirePermission(session as { user: { role: Role; id: string } }, "service:create")
    if (!permCheck.allowed) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.error === "Unauthorized" ? 401 : 403 })
    }

    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const trialCheck = await enforceServiceLimits(business.id)
    if (!trialCheck.allowed) {
      return NextResponse.json({ error: trialCheck.error }, { status: 403 })
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
