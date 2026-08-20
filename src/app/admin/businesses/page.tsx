"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Business {
  id: string
  name: string
  slug: string
  plan: string
  isActive: boolean
  createdAt: string
  owner: { name: string | null; email: string }
  template: { name: string; icon: string } | null
  _count: { staff: number; services: number; bookings: number }
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingBiz, setEditingBiz] = useState<Business | null>(null)
  const [editForm, setEditForm] = useState({ name: "", plan: "", isActive: true })

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const res = await fetch("/api/admin/businesses")
      if (res.ok) {
        setBusinesses(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch businesses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (biz: Business) => {
    setEditingBiz(biz)
    setEditForm({ name: biz.name, plan: biz.plan, isActive: biz.isActive })
  }

  const handleSave = async () => {
    if (!editingBiz) return

    try {
      const res = await fetch("/api/admin/businesses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingBiz.id, ...editForm }),
      })

      if (res.ok) {
        setEditingBiz(null)
        fetchBusinesses()
      }
    } catch (error) {
      console.error("Failed to update business:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this business?")) return

    try {
      const res = await fetch("/api/admin/businesses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        fetchBusinesses()
      }
    } catch (error) {
      console.error("Failed to delete business:", error)
    }
  }

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.owner.email.toLowerCase().includes(search.toLowerCase())
  )

  const planColors: Record<string, string> = {
    FREE: "bg-[#EFE9DA]/10 text-[#EFE9DA]/60",
    PRO: "bg-[#E8B547]/10 text-[#E8B547]",
    BUSINESS: "bg-blue-500/10 text-blue-400",
    ENTERPRISE: "bg-purple-500/10 text-purple-400",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#EFE9DA]/50">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#EFE9DA]">Businesses</h1>
          <p className="text-[#EFE9DA]/50 mt-1">{businesses.length} total businesses</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#263329]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Business</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Stats</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.map((biz) => (
                  <tr key={biz.id} className="border-b border-[#263329]/50 hover:bg-[#141C18]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{biz.template?.icon || "📋"}</span>
                        <div>
                          <div className="text-sm font-medium text-[#EFE9DA]">{biz.name}</div>
                          <div className="text-xs text-[#EFE9DA]/50">{biz.template?.name || "Unknown"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#EFE9DA]/70">{biz.owner.name || biz.owner.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${planColors[biz.plan] || ""}`}>
                        {biz.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#EFE9DA]/50">
                      {biz._count.staff} staff · {biz._count.services} services · {biz._count.bookings} bookings
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${biz.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {biz.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(biz)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(biz.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingBiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Plan</label>
                <select
                  value={editForm.plan}
                  onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]"
                >
                  <option value="FREE">Free</option>
                  <option value="STARTER">Starter (₹499/mo)</option>
                  <option value="PRO">Professional (₹999/mo)</option>
                  <option value="BUSINESS">Business (₹1,999/mo)</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-[#263329] bg-[#0A0F0D] text-[#E8B547]"
                />
                <label htmlFor="isActive" className="text-sm text-[#EFE9DA]">Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="primary" className="flex-1" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setEditingBiz(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
