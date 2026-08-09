import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
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
}
