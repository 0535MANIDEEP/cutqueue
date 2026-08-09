"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface StaffMember {
  id: string
  bio: string | null
  specialties: string[]
  yearsExp: number | null
  isAvailable: boolean
  user: { id: string; name: string | null; email: string }
}

export default function StaffSchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") fetchStaff()
  }, [status, router])

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff/schedule")
      if (res.ok) setStaff(await res.json())
    } catch (error) {
      console.error("Failed to fetch staff:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (staffId: string, current: boolean) => {
    try {
      const res = await fetch("/api/staff/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, isAvailable: !current }),
      })
      if (res.ok) {
        setStaff((prev) =>
          prev.map((s) => (s.id === staffId ? { ...s, isAvailable: !current } : s))
        )
      }
    } catch (error) {
      console.error("Failed to update availability:", error)
    }
  }

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
          <div>
            <h1 className="text-lg font-bold text-[#EFE9DA]">Staff Schedule</h1>
            <p className="text-xs text-[#EFE9DA]/40">Manage staff availability</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/owner")}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {staff.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-[#EFE9DA]/40 text-sm">No staff members found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#263329] flex items-center justify-center text-[#EFE9DA]/60 font-bold">
                        {member.user.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <div className="font-medium text-[#EFE9DA]">
                          {member.user.name || "Unnamed Staff"}
                        </div>
                        <div className="text-xs text-[#EFE9DA]/50">{member.user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAvailability(member.id, member.isAvailable)}
                      className={cn(
                        "w-10 h-6 rounded-full relative transition-colors",
                        member.isAvailable ? "bg-green-500" : "bg-[#263329]"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                          member.isAvailable ? "left-5" : "left-1"
                        )}
                      />
                    </button>
                  </div>

                  {member.yearsExp !== null && (
                    <div className="text-xs text-[#EFE9DA]/50 mb-2">
                      {member.yearsExp} years experience
                    </div>
                  )}

                  {member.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {member.specialties.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-[#E8B547]/10 text-[#E8B547] text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        member.isAvailable
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      )}
                    >
                      {member.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
