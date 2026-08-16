import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe, PLANS, type PlanKey } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const checkoutSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "BUSINESS"]),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const { plan } = parsed.data
    const planConfig = PLANS[plan as PlanKey]
    if (!planConfig.stripePriceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true, name: true, slug: true, email: true, plan: true },
    })

    if (!business) {
      return NextResponse.json({ error: "No business found" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: business.email,
      line_items: [
        {
          price: planConfig.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        businessId: business.id,
        ownerId: session.user.id,
        plan,
      },
      success_url: `${baseUrl}/dashboard/owner?upgraded=true`,
      cancel_url: `${baseUrl}/dashboard/owner/pricing`,
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error("Checkout session error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
