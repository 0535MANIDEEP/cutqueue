const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendTelegramMessage(
  message: string,
  chatId?: string
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return false
  }

  const targetChat = chatId || TELEGRAM_CHAT_ID

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: targetChat,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    )
    return response.ok
  } catch {
    return false
  }
}

export async function notifyOwnerNewBooking(data: {
  ownerChatId: string
  customerName: string
  service: string
  date: string
  time: string
  shopName: string
}): Promise<boolean> {
  const message = `\uD83D\uDCCB *New Booking*\n\n\uD83D\uDC64 ${data.customerName}\n\uD83C\uDFA8 ${data.service}\n\uD83D\uDCC5 ${data.date}\n\uD83D\uDD50 ${data.time}\n\n\uD83C\uDFEA ${data.shopName}`
  return sendTelegramMessage(message, data.ownerChatId)
}

export async function notifyOwnerQueueUpdate(data: {
  ownerChatId: string
  ticketNumber: number
  position: number
  shopName: string
}): Promise<boolean> {
  const message = `\uD83D\uDCE1 *Queue Update*\n\nTicket *#${data.ticketNumber}*\nPosition: ${data.position}\n\n\uD83C\uDFEA ${data.shopName}`
  return sendTelegramMessage(message, data.ownerChatId)
}

export async function notifyOwnerNewReview(data: {
  ownerChatId: string
  customerName: string
  rating: number
  shopName: string
}): Promise<boolean> {
  const stars = "\u2B50".repeat(data.rating)
  const message = `\uD83D\uDCDD *New Review*\n\n${stars}\n\uD83D\uDC64 ${data.customerName}\n\n\uD83C\uDFEA ${data.shopName}`
  return sendTelegramMessage(message, data.ownerChatId)
}

export async function notifyOwnerComplaint(data: {
  ownerChatId: string
  customerName: string
  subject: string
  shopName: string
}): Promise<boolean> {
  const message = `\u26A0 *New Complaint*\n\n\uD83D\uDC64 ${data.customerName}\n\uD83D\uDCAC ${data.subject}\n\n\uD83C\uDFEA ${data.shopName}`
  return sendTelegramMessage(message, data.ownerChatId)
}
