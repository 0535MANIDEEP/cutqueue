import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const services = await prisma.service.findMany({
    select: {
      id: true,
      name: true,
      duration: true,
      price: true,
      category: true,
      isActive: true,
      business: { select: { name: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(services)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id, name, description, duration, price, category, isActive } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Service ID required" }, { status: 400 })
  }

  const existing = await prisma.service.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(duration !== undefined && { duration: Math.max(1, duration) }),
      ...(price !== undefined && { price: Math.max(0, price) }),
      ...(category !== undefined && { category }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json(service)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Service ID required" }, { status: 400 })
  }

  const existing = await prisma.service.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  await prisma.service.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
