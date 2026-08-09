import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const templates = await prisma.industryTemplate.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { businesses: true } } },
  })

  return NextResponse.json(templates)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { slug, name, description, category, icon, queueType, features, defaultServices } = await req.json()

  if (!slug || !name || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const template = await prisma.industryTemplate.create({
    data: {
      slug,
      name,
      description: description || "",
      category,
      icon: icon || "📋",
      queueType: queueType || "ticket",
      features: features || [],
      defaultServices: defaultServices || [],
    },
  })

  return NextResponse.json(template, { status: 201 })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id, ...data } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Template ID required" }, { status: 400 })
  }

  const template = await prisma.industryTemplate.update({
    where: { id },
    data,
  })

  return NextResponse.json(template)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Template ID required" }, { status: 400 })
  }

  await prisma.industryTemplate.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
