import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    logger.error("Webhook signature verification failed", {}, error as Error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const { businessId, plan } = session.metadata || {}

        if (businessId && plan) {
          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + 1)

          await prisma.business.update({
            where: { id: businessId },
            data: {
              plan: plan as any,
              planExpiresAt: expiresAt,
            },
          })

          logger.info("Business plan upgraded", { businessId, plan })
        }
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        const { businessId } = invoice.metadata || {}

        if (businessId) {
          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + 1)

          await prisma.business.update({
            where: { id: businessId },
            data: { planExpiresAt: expiresAt },
          })

          logger.info("Subscription renewed", { businessId })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const { businessId } = invoice.metadata || {}

        if (businessId) {
          logger.warn("Subscription payment failed", { businessId })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const { businessId } = subscription.metadata || {}

        if (businessId) {
          await prisma.business.update({
            where: { id: businessId },
            data: {
              plan: "FREE",
              planExpiresAt: null,
            },
          })

          logger.info("Subscription cancelled, reverted to FREE", { businessId })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error("Webhook handler error", { eventType: event.type }, error as Error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
