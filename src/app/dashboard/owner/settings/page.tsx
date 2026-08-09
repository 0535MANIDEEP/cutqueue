"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { OpeningHours, DayHours } from "@/types"

const DAYS: { key: keyof OpeningHours; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
]

const DEFAULT_HOURS: OpeningHours = {
  mon: { open: "09:00", close: "18:00" },
  tue: { open: "09:00", close: "18:00" },
  wed: { open: "09:00", close: "18:00" },
  thu: { open: "09:00", close: "18:00" },
  fri: { open: "09:00", close: "18:00" },
  sat: { open: "10:00", close: "16:00" },
  sun: { open: "10:00", close: "14:00" },
}

export default function OwnerSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [openingHours, setOpeningHours] = useState<OpeningHours>(DEFAULT_HOURS)

  const fetchBusiness = async () => {
    try {
      const res = await fetch("/api/business/settings")
      if (res.ok) {
        const data = await res.json()
        setName(data.name || "")
        setDescription(data.description || "")
        setPhone(data.phone || "")
        setEmail(data.email || "")
        setAddress(data.address || "")
        if (data.openingHours && typeof data.openingHours === "object") {
          setOpeningHours({ ...DEFAULT_HOURS, ...data.openingHours })
        }
      }
    } catch {
      console.error("Failed to fetch business")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/business/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, phone, email, address, openingHours }),
      })
      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved successfully" })
      } else {
        setMessage({ type: "error", text: "Failed to save settings" })
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save settings" })
    } finally {
      setSaving(false)
    }
  }

  const updateDayHours = (day: keyof OpeningHours, field: keyof DayHours, value: string | boolean) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") fetchBusiness()
  }, [status, router])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center">
        <div className="text-[#EFE9DA]/50">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#0A0F0D]">
      <header className="border-b border-[#263329] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/owner" className="text-[#EFE9DA]/50 hover:text-[#EFE9DA]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-[#EFE9DA]">Business Settings</h1>
          </div>
          <Link href="/dashboard/owner">
            <Button variant="outline" size="sm">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {message && (
          <div
            className={cn(
              "p-3 rounded-lg text-sm",
              message.type === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            )}
          >
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-[#EFE9DA]/60 mb-1">Business Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-[#EFE9DA]/60 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-[#0F1B17] border border-[#2A3F3A] px-4 py-3 text-[#EFE9DA] placeholder:text-[#EFE9DA]/40 focus:outline-none focus:ring-2 focus:ring-[#E8B547]/50 focus:border-[#E8B547] transition-all duration-200 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#EFE9DA]/60 mb-1">Address</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opening Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DAYS.map(({ key, label }) => {
                const day = openingHours[key]
                const isClosed = day.closed
                return (
                  <div key={key} className="flex items-center gap-4 p-3 rounded-lg bg-[#141C18] border border-[#263329]/50">
                    <span className="w-10 text-sm font-medium text-[#EFE9DA]">{label}</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isClosed || false}
                        onChange={(e) => updateDayHours(key, "closed", e.target.checked)}
                        className="w-4 h-4 rounded border-[#2A3F3A] bg-[#0F1B17] text-[#E8B547] focus:ring-[#E8B547]/50"
                      />
                      <span className="text-xs text-[#EFE9DA]/50">Closed</span>
                    </label>
                    {!isClosed && (
                      <>
                        <Input
                          type="time"
                          value={day.open}
                          onChange={(e) => updateDayHours(key, "open", e.target.value)}
                          className="w-32"
                        />
                        <span className="text-[#EFE9DA]/40">to</span>
                        <Input
                          type="time"
                          value={day.close}
                          onChange={(e) => updateDayHours(key, "close", e.target.value)}
                          className="w-32"
                        />
                      </>
                    )}
                    {isClosed && (
                      <span className="text-sm text-[#EFE9DA]/30 italic">Closed</span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} isLoading={saving}>
            Save Changes
          </Button>
        </div>
      </main>
    </div>
  )
}
