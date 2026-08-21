"use client"
import { getWaUrlForTemplate, isPremium } from "@/lib/whatsapp-templates"

export function WaButton({ label, template, phone, plan, variant = "primary", className = "" }: { label: string; template: string; phone?: string; plan?: string | null; variant?: "primary" | "ghost" | "gold"; className?: string }) {
  const url = getWaUrlForTemplate(template, phone)
  const premium = isPremium(plan)
  const base = variant === "gold" ? "bg-[#E8B547] text-[#0A0F0D] border-[#E8B547]" : variant === "ghost" ? "bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]/80" : "bg-emerald-500 text-white border-emerald-500"
  return (
    <a href={url} target="_blank" rel="noopener" className={`inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-bold border hover:scale-[1.02] transition ${base} ${className}`} title={premium ? "Auto-send enabled for PRO" : "Free: opens WhatsApp with prefilled message"}>
      {label} {premium ? "✓" : "↗"}
    </a>
  )
}

export function WaCopyLink({ url, label = "Copy link" }: { url: string; label?: string }) {
  return (
    <button onClick={() => navigator.clipboard.writeText(url)} className="inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-semibold bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]">
      {label}
    </button>
  )
}
