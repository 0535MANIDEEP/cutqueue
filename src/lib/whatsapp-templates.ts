export type Plan = "FREE" | "PRO" | "BUSINESS"
export const isPremium = (plan?: string | null) => plan === "PRO" || plan === "BUSINESS"

function waUrl(phone: string | undefined, text: string) {
  const clean = phone?.replace(/\D/g, "")
  const body = encodeURIComponent(text)
  if (clean && clean.length >= 10) {
    const withCountry = clean.length === 10 ? `91${clean}` : clean
    return `https://wa.me/${withCountry}?text=${body}`
  }
  return `https://wa.me/?text=${body}`
}
export function getWaUrlForTemplate(template: string, phone?: string) { return waUrl(phone, template) }
export function isAutomationEnabled(plan?: string | null) { return isPremium(plan) }
export function statusUrlFor(businessId: string, ticket: number) {
  const base = typeof window !== "undefined" ? window.location.origin : "https://cutqueue-amber.vercel.app"
  return `${base}/queue/status?businessId=${businessId}&ticket=${ticket}`
}
export function bookUrlFor(shopSlug: string) {
  const base = typeof window !== "undefined" ? window.location.origin : "https://cutqueue-amber.vercel.app"
  return `${base}/book?shop=${shopSlug}`
}
export function queueJoinUrlFor(shopSlug: string) {
  const base = typeof window !== "undefined" ? window.location.origin : "https://cutqueue-amber.vercel.app"
  return `${base}/queue/join?shop=${shopSlug}`
}

// ── CUSTOMER → BUSINESS ──
export function joinTemplate(p: { shopName: string; ticket: number; position: number | null; statusUrl: string; avgWaitPerPerson?: number }) {
  const wait = p.position ? `${(p.position - 1) * (p.avgWaitPerPerson ?? 3)} min` : "a few min"
  return `✅ *${p.shopName}*\n\nTicket *#${p.ticket}* confirmed!\nPosition: *${p.position ?? "-"}* • Wait: ~${wait}\n\nTrack live:\n${p.statusUrl}\n\nReply:\n1️⃣ Check position\n2️⃣ Leave queue\n3️⃣ Directions`
}
export function checkPositionTemplate(p: { shopName: string; ticket: number; position: number }) {
  return `📍 *${p.shopName}* — Position check\n\nHi, what's my current position for ticket *#${p.ticket}*? (You showed ${p.position})\n\nReply with updated position please.`
}
export function leaveQueueTemplate(p: { shopName: string; ticket: number }) {
  return `🚪 *${p.shopName}* — Leave queue\n\nPlease remove my ticket *#${p.ticket}* from queue. I need to leave.\n\nReply: ✅ Removed / ❓ Confirm?`
}
export function cancelBookingTemplate(p: { shopName: string; serviceName: string; date: string; time: string }) {
  return `❌ *${p.shopName}* — Cancel booking\n\nPlease cancel my *${p.serviceName}* on *${p.date}* at *${p.time}*.\n\nReason: Not available\nReply: ✅ Cancelled`
}
export function rescheduleBookingTemplate(p: { shopName: string; serviceName: string; date: string; time: string }) {
  return `🔄 *${p.shopName}* — Reschedule request\n\nCan we move my *${p.serviceName}* from *${p.date} ${p.time}* to another slot?\n\nPreferred: Tomorrow same time\nReply with available slots.`
}
export function bookForSomeoneElseTemplate(p: { shopName: string; serviceName: string; date: string; time: string; otherName: string; otherPhone: string }) {
  return `👥 *${p.shopName}* — Book for someone else\n\nPlease book *${p.serviceName}* on *${p.date} ${p.time}* for *${p.otherName}* (${p.otherPhone}) under my reference.\n\nReply: ✅ Booked #?`
}
export function runningLateTemplate(p: { shopName: string; ticket: number; minutes: number }) {
  return `⏰ *${p.shopName}* — Running late\n\nHi, ticket *#${p.ticket}* will be ~${p.minutes} min late. Please hold my spot.\n\nReply: ✅ Held / ❌ Moved back 1`
}
export function arrivedTemplate(p: { shopName: string; ticket: number }) {
  return `📍 *${p.shopName}* — I've arrived\n\nHi, ticket *#${p.ticket}* — I'm at the shop now. Ready when you call.\n\nReply: ✅ Noted — you're next!`
}
export function modifyServiceTemplate(p: { shopName: string; ticket: number; newService: string }) {
  return `✏️ *${p.shopName}* — Change service\n\nHi, ticket *#${p.ticket}* — can I change to *${p.newService}* instead?\n\nReply: ✅ Updated / 💰 Price diff?`
}

// ── BUSINESS → CUSTOMER ──
export function callNextTemplate(p: { shopName: string; ticket: number; serviceType: string }) {
  return `🔔 *${p.shopName}* — Your turn!\n\nTicket *#${p.ticket}* (${p.serviceType}) — please proceed to counter now.\n\nReply:\n✅ YES — Coming\n⏰ LATE 5m`
}
export function delayTemplate(p: { shopName: string; ticket: number; delayMin: number }) {
  return `⏳ *${p.shopName}* — Short delay\n\nHi, ticket *#${p.ticket}* — small delay ~${p.delayMin} min. Stay nearby, you're still on priority.\n\nReply: ✅ OK / 🚪 Leave`
}
export function queuePausedTemplate(p: { shopName: string; resumeTime?: string }) {
  return `⏸️ *${p.shopName}* — Queue paused\n\nHi, queue is briefly paused${p.resumeTime ? ` till ${p.resumeTime}` : ""}. Your position is held.\n\nReply: ✅ OK`
}
export function shopClosingTemplate(p: { shopName: string; ticket: number }) {
  return `🏁 *${p.shopName}* — Closing soon\n\nHi, ticket *#${p.ticket}* — we're closing in 20 min. Want to rebook tomorrow?\n\nReply:\n1️⃣ Rebook tomorrow\n2️⃣ Cancel`
}
export function bookingConfirmedTemplate(p: { shopName: string; serviceName: string; date: string; time: string }) {
  return `📅 *${p.shopName}* — Booking confirmed!\n\n*${p.serviceName}* on *${p.date}* at *${p.time}*\n\nReply:\nC — Cancel\nR — Reschedule`
}
export function bookingCancelledByBusinessTemplate(p: { shopName: string; serviceName: string; date: string; time: string; reason?: string }) {
  return `❌ *${p.shopName}* — Booking cancelled\n\nSorry, your *${p.serviceName}* on *${p.date} ${p.time}* is cancelled${p.reason ? ` (${p.reason})` : ""}.\n\nRebook?: ${bookUrlFor(p.shopName)}\nReply: 🔄 Rebook`
}
export function rescheduleOfferTemplate(p: { shopName: string; oldDate: string; oldTime: string; newDate: string; newTime: string }) {
  return `🔄 *${p.shopName}* — New slot offered\n\nMoved from *${p.oldDate} ${p.oldTime}* → *${p.newDate} ${p.newTime}*.\n\nReply:\n✅ Accept\n❌ Another slot`
}
export function reminderTemplate(p: { shopName: string; ticket: number }) {
  return `⏰ *${p.shopName}* — You're next!\n\nTicket *#${p.ticket}* — reach in 2 min?\n\nReply:\nOK — On my way\n⏰ Delay 5m`
}
export function serviceDoneTemplate(p: { shopName: string; ticket: number; serviceName: string; amount?: number }) {
  return `✅ *${p.shopName}* — Service done!\n\nTicket *#${p.ticket}* (${p.serviceName}) completed${p.amount ? ` • Paid ₹${p.amount}` : ""}.\n\nInvoice available. Loved it? ⭐ Rate us!`
}
export function reviewTemplate(p: { shopName: string; reviewUrl: string }) {
  return `⭐ Loved service at *${p.shopName}*?\n\nTap to rate us:\n${p.reviewUrl}\n\nReply 5️⃣ for Google — helps us a lot!`
}
export function noShowTemplate(p: { shopName: string; ticket: number }) {
  return `⚠️ *${p.shopName}* — Missed your turn\n\nTicket *#${p.ticket}* — we called but you weren't there. Reply to re-add:\n\n1️⃣ Re-add me\n2️⃣ Cancel`
}
export function bookForSomeoneProxyTemplate(p: { shopName: string; otherName: string; serviceName: string; date: string; time: string }) {
  return `👥 *${p.shopName}* — Proxy booking done\n\nBooked *${p.serviceName}* for *${p.otherName}* on *${p.date} ${p.time}*.\n\nShare this with them:\n${bookUrlFor(p.shopName)}`
}
export function monthlyRemainderTemplate(p: { shopName: string; customerName: string; serviceName?: string; shopSlug: string }) {
  return `💈 *${p.shopName}* — Monthly remainder\n\nHi ${p.customerName}! Your ${p.serviceName || "haircut"} is due this month. Last visit was ~30 days ago.\n\nBook your next slot (2 taps):\n${bookUrlFor(p.shopSlug)}\n\nReply:\n1️⃣ Book tomorrow 10am\n2️⃣ Need different time`
}
