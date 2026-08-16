import { NextResponse } from "next/server"
import { generateGstInvoice } from "@/lib/upi"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      invoiceNumber,
      shopName,
      shopAddress,
      shopGstin,
      customerName,
      items,
      cgstRate = 9,
      sgstRate = 9,
    } = body

    if (!invoiceNumber || !shopName || !customerName || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const invoice = generateGstInvoice({
      invoiceNumber,
      date: new Date().toLocaleDateString("en-IN"),
      shopName,
      shopAddress: shopAddress || "",
      shopGstin,
      customerName,
      items,
      cgstRate,
      sgstRate,
    })

    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; rate: number }) => sum + item.quantity * item.rate,
      0
    )
    const cgst = subtotal * (cgstRate / 100)
    const sgst = subtotal * (sgstRate / 100)
    const total = subtotal + cgst + sgst

    return NextResponse.json({
      invoice,
      subtotal,
      cgst,
      sgst,
      total,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}
