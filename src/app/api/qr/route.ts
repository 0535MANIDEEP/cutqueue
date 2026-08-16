import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get("shop")

  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 })
  }

  const business = await prisma.business.findUnique({
    where: { slug: shop },
    select: { id: true, name: true, slug: true, phone: true },
  })

  if (!business) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const queueJoinUrl = `${baseUrl}/queue/join?shop=${business.slug}`

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(queueJoinUrl)}&margin=10&color=1a1a2e&bgcolor=ffffff`

  return NextResponse.json({
    shop: business.name,
    slug: business.slug,
    phone: business.phone,
    queueJoinUrl,
    qrUrl: qrApiUrl,
  })
}
