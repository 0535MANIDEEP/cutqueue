import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")

    if (slug) {
      const business = await prisma.business.findFirst({
        where: { slug, isActive: true },
      })

      if (!business) {
        return NextResponse.json({ error: "Shop not found" }, { status: 404 })
      }

      const services = await prisma.service.findMany({
        where: { businessId: business.id, isActive: true },
        orderBy: { name: "asc" },
      })

      const staffList = await prisma.staff.findMany({
        where: { businessId: business.id, isAvailable: true },
        include: { user: { select: { id: true, name: true } } },
      })

      return NextResponse.json({
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          address: business.address,
          city: business.city,
          phone: business.phone,
        },
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          duration: s.duration,
          price: s.price,
        })),
        staff: staffList.map((s) => ({
          id: s.id,
          name: s.user.name,
        })),
      })
    }

    const businesses = await prisma.business.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        logoUrl: true,
        template: { select: { name: true, icon: true, slug: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(businesses)
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
