"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { AnnouncementType } from "@/types"

interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  isActive: boolean
  startsAt: string | null
  expiresAt: string | null
  createdAt: string
}

const TYPE_OPTIONS: { value: AnnouncementType; label: string }[] = [
  { value: "GENERAL", label: "General" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "CLOSURE", label: "Closure" },
  { value: "HOLIDAY", label: "Holiday" },
  { value: "EVENT", label: "Event" },
]

const TYPE_STYLES: Record<AnnouncementType, string> = {
  GENERAL: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  PROMOTION: "bg-[#E8B547]/10 text-[#E8B547] border-[#E8B547]/30",
  CLOSURE: "bg-red-500/10 text-red-400 border-red-500/30",
  HOLIDAY: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  EVENT: "bg-green-500/10 text-green-400 border-green-500/30",
}

export default function OwnerAnnouncementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newType, setNewType] = useState<AnnouncementType>("GENERAL")
  const [creating, setCreating] = useState(false)

  const fetchAnnouncements = async () => {
    try {
      const businessRes = await fetch("/api/business/settings")
      if (!businessRes.ok) return
      const business = await businessRes.json()

      const res = await fetch(`/api/announcements?businessId=${business.id}`)
      if (res.ok) {
        setAnnouncements(await res.json())
      }
    } catch {
      console.error("Failed to fetch announcements")
    } finally {
      setLoading(false)
    }
  }

  const createAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent, type: newType }),
      })
      if (res.ok) {
        setNewTitle("")
        setNewContent("")
        setNewType("GENERAL")
        setShowForm(false)
        fetchAnnouncements()
      }
    } catch {
      console.error("Failed to create announcement")
    } finally {
      setCreating(false)
    }
  }

  const deleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch("/api/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: id }),
      })
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id))
      }
    } catch {
      console.error("Failed to delete announcement")
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") fetchAnnouncements()
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
            <h1 className="text-lg font-bold text-[#EFE9DA]">Announcements</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "New Announcement"}
            </Button>
            <Link href="/dashboard/owner">
              <Button variant="outline" size="sm">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Title</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Announcement content"
                  className="w-full rounded-lg bg-[#0F1B17] border border-[#2A3F3A] px-4 py-3 text-[#EFE9DA] placeholder:text-[#EFE9DA]/40 focus:outline-none focus:ring-2 focus:ring-[#E8B547]/50 focus:border-[#E8B547] transition-all duration-200 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as AnnouncementType)}
                  className="w-full h-10 rounded-lg bg-[#0F1B17] border border-[#2A3F3A] px-4 text-[#EFE9DA] focus:outline-none focus:ring-2 focus:ring-[#E8B547]/50 focus:border-[#E8B547] transition-all duration-200"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" onClick={createAnnouncement} isLoading={creating}>
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-[#EFE9DA]/40 text-sm">No announcements yet. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <Card key={a.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-[#EFE9DA] truncate">{a.title}</h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium border",
                            TYPE_STYLES[a.type]
                          )}
                        >
                          {a.type}
                        </span>
                      </div>
                      <p className="text-sm text-[#EFE9DA]/60 line-clamp-2">{a.content}</p>
                      <p className="text-xs text-[#EFE9DA]/30 mt-2">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteAnnouncement(a.id)}
                    >
                      Delete
                    </Button>
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
