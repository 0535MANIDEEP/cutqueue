"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Complaint {
  id: string
  category: string
  subject: string
  description: string
  status: string
  priority: string
  response: string | null
  respondedAt: string | null
  resolvedAt: string | null
  createdAt: string
  customer: { name: string | null; email: string }
  business: { name: string }
}

const statusFilters = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "DISMISSED"] as const

const statusColors: Record<string, string> = {
  OPEN: "bg-yellow-500/10 text-yellow-400",
  IN_PROGRESS: "bg-[#E8B547]/10 text-[#E8B547]",
  RESOLVED: "bg-green-500/10 text-green-400",
  DISMISSED: "bg-gray-500/10 text-gray-400",
}

const categoryLabels: Record<string, string> = {
  SERVICE_QUALITY: "Service Quality",
  WAIT_TIME: "Wait Time",
  STAFF_BEHAVIOR: "Staff Behavior",
  PRICING: "Pricing",
  CLEANLINESS: "Cleanliness",
  OTHER: "Other",
}

export default function AdminComplaintsPage() {
  const { data: session } = useSession()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints")
      if (res.ok) {
        setComplaints(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitResponse = async (complaintId: string) => {
    const response = responses[complaintId]
    if (!response?.trim()) return

    setSubmittingId(complaintId)
    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId,
          response: response.trim(),
          status: "IN_PROGRESS",
        }),
      })

      if (res.ok) {
        setResponses((prev) => ({ ...prev, [complaintId]: "" }))
        fetchComplaints()
      }
    } catch (error) {
      console.error("Failed to submit response:", error)
    } finally {
      setSubmittingId(null)
    }
  }

  const handleStatusChange = async (complaintId: string, status: string) => {
    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId, status }),
      })

      if (res.ok) {
        fetchComplaints()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const filtered = complaints.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter
    const matchesSearch =
      search === "" ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.customer.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.business.name.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#EFE9DA]/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#EFE9DA]">Complaints</h1>
        <p className="text-[#EFE9DA]/50 mt-1">{complaints.length} total complaints</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-[#E8B547]/20 text-[#E8B547]"
                  : "bg-[#1E2E29] text-[#EFE9DA]/60 hover:text-[#EFE9DA] hover:bg-[#263329]"
              }`}
            >
              {status === "ALL" ? "All" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((complaint) => (
          <Card key={complaint.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[complaint.status] || ""}`}>
                      {complaint.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-[#EFE9DA]/40">
                      {categoryLabels[complaint.category] || complaint.category}
                    </span>
                    <span className="text-xs text-[#EFE9DA]/40">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base">{complaint.subject}</CardTitle>
                </div>
                <select
                  value={complaint.status}
                  onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                  className="rounded-lg bg-[#0F1B17] border border-[#263329] text-[#EFE9DA] text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#E8B547]/50"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-[#EFE9DA]/40">Customer:</span>{" "}
                    <span className="text-[#EFE9DA]">{complaint.customer.name || "Unnamed"}</span>
                  </div>
                  <div>
                    <span className="text-[#EFE9DA]/40">Business:</span>{" "}
                    <span className="text-[#EFE9DA]">{complaint.business.name}</span>
                  </div>
                </div>

                <p className="text-sm text-[#EFE9DA]/70 whitespace-pre-wrap">{complaint.description}</p>

                {complaint.response && (
                  <div className="bg-[#1E2E29] rounded-lg p-3 border border-[#263329]">
                    <p className="text-xs text-[#EFE9DA]/40 mb-1">Response</p>
                    <p className="text-sm text-[#EFE9DA]/80 whitespace-pre-wrap">{complaint.response}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <textarea
                    placeholder="Write a response..."
                    value={responses[complaint.id] || ""}
                    onChange={(e) => setResponses((prev) => ({ ...prev, [complaint.id]: e.target.value }))}
                    className="flex-1 min-h-[80px] rounded-lg bg-[#0F1B17] border border-[#263329] px-3 py-2 text-sm text-[#EFE9DA] placeholder:text-[#EFE9DA]/40 focus:outline-none focus:ring-2 focus:ring-[#E8B547]/50 resize-none"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!responses[complaint.id]?.trim()}
                    isLoading={submittingId === complaint.id}
                    onClick={() => handleSubmitResponse(complaint.id)}
                    className="self-end"
                  >
                    Respond
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#EFE9DA]/40">No complaints found</div>
        )}
      </div>
    </div>
  )
}
