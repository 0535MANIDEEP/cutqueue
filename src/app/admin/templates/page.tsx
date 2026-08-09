"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Template {
  id: string
  slug: string
  name: string
  description: string
  category: string
  icon: string
  queueType: string
  features: string[]
  defaultServices: { name: string; duration: number; price: number }[]
  createdAt: string
  _count: { businesses: number }
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    icon: "",
    queueType: "",
  })
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    slug: "",
    name: "",
    description: "",
    category: "beauty",
    icon: "📋",
    queueType: "ticket",
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/templates")
      if (res.ok) {
        setTemplates(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setEditForm({
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon,
      queueType: template.queueType,
    })
  }

  const handleSave = async () => {
    if (!editingTemplate) return

    try {
      const res = await fetch("/api/admin/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingTemplate.id, ...editForm }),
      })

      if (res.ok) {
        setEditingTemplate(null)
        fetchTemplates()
      }
    } catch (error) {
      console.error("Failed to update template:", error)
    }
  }

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })

      if (res.ok) {
        setShowCreate(false)
        setCreateForm({ slug: "", name: "", description: "", category: "beauty", icon: "📋", queueType: "ticket" })
        fetchTemplates()
      }
    } catch (error) {
      console.error("Failed to create template:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const res = await fetch("/api/admin/templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        fetchTemplates()
      }
    } catch (error) {
      console.error("Failed to delete template:", error)
    }
  }

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  )

  const categoryColors: Record<string, string> = {
    beauty: "bg-pink-500/10 text-pink-400",
    healthcare: "bg-blue-500/10 text-blue-400",
    automotive: "bg-orange-500/10 text-orange-400",
    fitness: "bg-green-500/10 text-green-400",
    government: "bg-gray-500/10 text-gray-400",
    finance: "bg-yellow-500/10 text-yellow-400",
    creative: "bg-purple-500/10 text-purple-400",
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
          <h1 className="text-3xl font-bold text-[#EFE9DA]">Industry Templates</h1>
          <p className="text-[#EFE9DA]/50 mt-1">{templates.length} templates available</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          Add Template
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:border-[#E8B547]/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{template.icon}</span>
                  <div>
                    <h3 className="font-semibold text-[#EFE9DA]">{template.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[template.category] || "bg-[#EFE9DA]/10 text-[#EFE9DA]/60"}`}>
                      {template.category}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-[#EFE9DA]/50">{template._count.businesses} businesses</span>
              </div>
              <p className="text-sm text-[#EFE9DA]/50 mb-4 line-clamp-2">{template.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 rounded bg-[#0A0F0D] text-xs text-[#EFE9DA]/60">{template.queueType} queue</span>
                <span className="px-2 py-1 rounded bg-[#0A0F0D] text-xs text-[#EFE9DA]/60">{template.features.length} features</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(template)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(template.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Name</label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Description</label>
                <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#EFE9DA]/60 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full p-2 rounded-lg bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]"
                  >
                    <option value="beauty">Beauty</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="automotive">Automotive</option>
                    <option value="fitness">Fitness</option>
                    <option value="government">Government</option>
                    <option value="finance">Finance</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#EFE9DA]/60 mb-1">Queue Type</label>
                  <select
                    value={editForm.queueType}
                    onChange={(e) => setEditForm({ ...editForm, queueType: e.target.value })}
                    className="w-full p-2 rounded-lg bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]"
                  >
                    <option value="ticket">Ticket</option>
                    <option value="appointment">Appointment</option>
                    <option value="slot">Slot</option>
                    <option value="number">Number</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Icon (emoji)</label>
                <Input value={editForm.icon} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="primary" className="flex-1" onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" className="flex-1" onClick={() => setEditingTemplate(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Slug</label>
                <Input value={createForm.slug} onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })} placeholder="e.g. nail-studio" />
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Name</label>
                <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Description</label>
                <Input value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#EFE9DA]/60 mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full p-2 rounded-lg bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]"
                  >
                    <option value="beauty">Beauty</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="automotive">Automotive</option>
                    <option value="fitness">Fitness</option>
                    <option value="government">Government</option>
                    <option value="finance">Finance</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#EFE9DA]/60 mb-1">Queue Type</label>
                  <select
                    value={createForm.queueType}
                    onChange={(e) => setCreateForm({ ...createForm, queueType: e.target.value })}
                    className="w-full p-2 rounded-lg bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]"
                  >
                    <option value="ticket">Ticket</option>
                    <option value="appointment">Appointment</option>
                    <option value="slot">Slot</option>
                    <option value="number">Number</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Icon (emoji)</label>
                <Input value={createForm.icon} onChange={(e) => setCreateForm({ ...createForm, icon: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="primary" className="flex-1" onClick={handleCreate}>Create Template</Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
