import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendTelegramMessage } from "@/lib/telegram"

export async function POST(request: Request) {
  try {
    const { upiId, shopName, amount, customerPhone, service } = await request.json()

    if (!upiId || !shopName || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(service || "QueueForge Payment")}`

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiString)}&margin=10&color=1a1a2e&bgcolor=ffffff`

    return NextResponse.json({
      upiString,
      qrUrl,
      upiId,
      amount,
      shopName,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate UPI QR" }, { status: 500 })
  }
}
