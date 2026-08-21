import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { businessId, queueEntryId, serviceName, amount } = body

    if (!businessId || !serviceName || !amount) {
      return NextResponse.json(
        { error: "businessId, serviceName, and amount are required" },
        { status: 400 }
      )
    }

    const business = await prisma.business.findFirst({
      where: { id: businessId, ownerId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const invoiceNumber = `INV-${Date.now()}`
    const subtotal = Number(amount)
    const gstRate = 5
    const cgst = subtotal * 0.025
    const sgst = subtotal * 0.025
    const total = subtotal + cgst + sgst

    const invoice = {
      invoiceNumber,
      date: new Date().toISOString(),
      business: {
        name: business.name,
        gstNumber: (business as Record<string, unknown>).gstNumber || null,
        address: business.address || "",
        phone: business.phone || "",
      },
      items: [
        {
          description: serviceName,
          amount: subtotal,
        },
      ],
      subtotal,
      gst: {
        rate: gstRate,
        cgst,
        sgst,
        total: cgst + sgst,
      },
      total,
      queueEntryId: queueEntryId || null,
    }

    logger.info("Invoice generated", {
      businessId,
      invoiceNumber,
      total,
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    logger.error("Invoice generation error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
