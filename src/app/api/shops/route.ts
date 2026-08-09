import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const shops = await prisma.barberShop.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      logoUrl: true,
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(shops)
}
