import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      isActive: true,
      createdAt: true,
      owner: { select: { name: true, email: true } },
      template: { select: { name: true, icon: true } },
      _count: { select: { staff: true, services: true, bookings: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(businesses)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id, plan, isActive, name } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 })
  }

  const updated = await prisma.business.update({
    where: { id },
    data: {
      ...(plan && { plan }),
      ...(isActive !== undefined && { isActive }),
      ...(name && { name }),
    },
    select: { id: true, name: true, plan: true, isActive: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 })
  }

  await prisma.business.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
