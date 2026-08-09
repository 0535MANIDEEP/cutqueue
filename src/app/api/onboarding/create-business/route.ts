import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { templates } from "@/lib/templates"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { businessName, templateSlug } = await req.json()

    if (!businessName || !templateSlug) {
      return NextResponse.json(
        { error: "Business name and industry are required" },
        { status: 400 }
      )
    }

    const existingBusiness = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
    })

    if (existingBusiness) {
      return NextResponse.json(
        { error: "You already have a business" },
        { status: 400 }
      )
    }

    const template = await prisma.industryTemplate.findUnique({
      where: { slug: templateSlug },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Industry template not found" },
        { status: 400 }
      )
    }

    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const business = await prisma.business.create({
      data: {
        ownerId: session.user.id,
        templateId: template.id,
        name: businessName,
        slug: `${slug}-${session.user.id.slice(0, 6)}`,
        phone: "",
        email: session.user.email || "",
        address: "",
        city: "",
        openingHours: {},
        settings: {},
      },
    })

    await prisma.queue.create({
      data: {
        businessId: business.id,
        queueType: template.queueType as string,
      },
    })

    const templateData = templates.find((t) => t.slug === templateSlug)
    if (templateData?.defaultServices) {
      await prisma.service.createMany({
        data: templateData.defaultServices.map((s) => ({
          businessId: business.id,
          name: s.name,
          description: s.name,
          duration: s.duration,
          price: s.price,
          category: s.category,
        })),
      })
    }

    return NextResponse.json({ message: "Business created", businessId: business.id })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
