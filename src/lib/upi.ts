export function generateUpiString(
  upiId: string,
  amount: number,
  merchantName: string,
  transactionNote?: string
): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: merchantName,
    am: amount.toString(),
    cu: "INR",
    tn: transactionNote || "QueueForge Payment",
  })
  return `upi://pay?${params.toString()}`
}

export function getUpiQrDataUrl(upiString: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}&margin=10`
}

export function generateUpiQrUrl(
  upiId: string,
  amount: number,
  merchantName: string
): string {
  const upiString = generateUpiString(upiId, amount, merchantName)
  return getUpiQrDataUrl(upiString)
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function generateGstInvoice(data: {
  invoiceNumber: string
  date: string
  shopName: string
  shopAddress: string
  shopGstin?: string
  customerName: string
  items: { description: string; quantity: number; rate: number }[]
  cgstRate?: number
  sgstRate?: number
}): string {
  const { invoiceNumber, date, shopName, shopAddress, shopGstin, customerName, items, cgstRate = 9, sgstRate = 9 } = data

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const cgst = subtotal * (cgstRate / 100)
  const sgst = subtotal * (sgstRate / 100)
  const total = subtotal + cgst + sgst

  return `
TAX INVOICE
================================
Invoice #: ${invoiceNumber}
Date: ${date}
================================

FROM:
${shopName}
${shopAddress}
${shopGstin ? `GSTIN: ${shopGstin}` : ""}

TO:
${customerName}

--------------------------------
ITEMS
--------------------------------
${items.map((item) => `${item.description} x${item.quantity}  \u20B9${item.rate * item.quantity}`).join("\n")}

--------------------------------
Subtotal:  \u20B9${subtotal.toFixed(2)}
CGST (${cgstRate}%): \u20B9${cgst.toFixed(2)}
SGST (${sgstRate}%): \u20B9${sgst.toFixed(2)}
--------------------------------
TOTAL:     \u20B9${total.toFixed(2)}
================================

Thank you for your visit!
Powered by QueueForge
  `.trim()
}
