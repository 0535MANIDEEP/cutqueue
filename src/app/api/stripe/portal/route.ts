import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    if (!business) {
      return NextResponse.json({ error: "No business found" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: undefined,
      return_url: `${baseUrl}/dashboard/owner`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Portal session error:", error)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
