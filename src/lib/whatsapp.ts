export function getWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "")
  const formatted = cleaned.startsWith("91") ? cleaned : `91${cleaned}`
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${formatted}?text=${encoded}`
}

export function getWhatsAppDeepLink(phone: string, message: string): string {
  return `whatsapp://send?phone=${phone.replace(/\D/g, "")}&text=${encodeURIComponent(message)}`
}

export function sendQueueNotification(
  customerPhone: string,
  ticketNumber: number,
  position: number,
  estimatedWait: number,
  shopName: string
): string {
  const message = `\uD83D\uDFE2 *${shopName}*\n\nYour ticket *#${ticketNumber}* is active!\n\n\uD83D\uDCCD Position: ${position}\n\u23F1 Est. wait: ${estimatedWait} min\n\nWe'll notify you when it's your turn.`
  return getWhatsAppUrl(customerPhone, message)
}

export function sendBookingConfirmation(
  customerPhone: string,
  shopName: string,
  service: string,
  date: string,
  time: string
): string {
  const message = `\u2705 *Booking Confirmed!*\n\n\uD83C\uDFA8 *${shopName}*\n\uD83D\uDCCB ${service}\n\uD83D\uDCC5 ${date}\n\uD83D\uDD50 ${time}\n\nSee you there!`
  return getWhatsAppUrl(customerPhone, message)
}

export function sendTurnReady(
  customerPhone: string,
  ticketNumber: number,
  shopName: string
): string {
  const message = `\uD83D\uDD14 *Your turn!*\n\nTicket *#${ticketNumber}* at *${shopName}*\n\nPlease come to the counter now!`
  return getWhatsAppUrl(customerPhone, message)
}

export function sendPaymentRequest(
  customerPhone: string,
  amount: number,
  upiId: string,
  shopName: string
): string {
  const message = `\uD83D\uDCB3 *Payment Request*\n\nAmount: \u20B9${amount}\nTo: ${shopName}\nUPI: ${upiId}\n\nPay via any UPI app.`
  return getWhatsAppUrl(customerPhone, message)
}
