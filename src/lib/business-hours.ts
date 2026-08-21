export type DayHours = { open?: string; close?: string; lunchStart?: string; lunchEnd?: string; closed?: boolean }
export type OpeningHours = Record<string, DayHours>

const DAY_KEYS = ["sun","mon","tue","wed","thu","fri","sat"] as const

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + (m || 0)
}
function fmtMin(min: number) {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  const ampm = h >= 12 ? "PM" : "AM"
  const hr = h % 12 || 12
  return `${hr}:${String(m).padStart(2,"0")} ${ampm}`
}
export function nowIST() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
}
export function startOfTodayIST(now = nowIST()) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isBusinessOpen(openingHours: OpeningHours | null | undefined, now = nowIST(), holidays?: { date: string; closed: boolean }[]) {
  if (!openingHours) return { open: true, reason: null as string | null, nextOpenAt: null as string | null }
  const day = DAY_KEYS[now.getDay()]
  const todayStr = now.toISOString().slice(0,10)
  if (holidays?.some(h => h.date === todayStr && h.closed)) {
    return { open: false, reason: "Holiday — closed today", nextOpenAt: "Tomorrow" }
  }
  const dh = openingHours[day] || openingHours[day.toLowerCase()] || openingHours[DAY_KEYS[now.getDay()].toUpperCase() as string]
  if (!dh || dh.closed) return { open: false, reason: "Closed today", nextOpenAt: "Tomorrow" }
  if (!dh.open || !dh.close) return { open: true, reason: null, nextOpenAt: null }
  const cur = now.getHours() * 60 + now.getMinutes()
  const openMin = toMin(dh.open)
  const closeMin = toMin(dh.close)
  if (cur < openMin) return { open: false, reason: `Opens at ${fmtMin(openMin)}`, nextOpenAt: fmtMin(openMin) }
  if (cur >= closeMin) return { open: false, reason: `Closed — opens tomorrow at ${fmtMin(openMin)}`, nextOpenAt: fmtMin(openMin) }
  if (dh.lunchStart && dh.lunchEnd) {
    const ls = toMin(dh.lunchStart); const le = toMin(dh.lunchEnd)
    if (cur >= ls && cur < le) return { open: false, reason: `Lunch break till ${fmtMin(le)}`, nextOpenAt: fmtMin(le) }
  }
  return { open: true, reason: null, nextOpenAt: null }
}

export function nextOpenLabel(openingHours: OpeningHours | null | undefined, now = nowIST()) {
  return isBusinessOpen(openingHours, now).nextOpenAt
}

export const defaultOpeningHours: OpeningHours = {
  mon: { open: "10:00", close: "21:00", lunchStart: "14:00", lunchEnd: "15:00" },
  tue: { open: "10:00", close: "21:00", lunchStart: "14:00", lunchEnd: "15:00" },
  wed: { open: "10:00", close: "21:00", lunchStart: "14:00", lunchEnd: "15:00" },
  thu: { open: "10:00", close: "21:00", lunchStart: "14:00", lunchEnd: "15:00" },
  fri: { open: "10:00", close: "21:00", lunchStart: "14:00", lunchEnd: "15:00" },
  sat: { open: "10:00", close: "21:00" },
  sun: { closed: true },
}
