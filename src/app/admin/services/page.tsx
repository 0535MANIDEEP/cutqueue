"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Service {
  id: string
  name: string
  duration: number
  price: number
  category: string
  isActive: boolean
  business: { name: string; id: string }
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editForm, setEditForm] = useState({ name: "", duration: 30, price: 0, category: "", isActive: true })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/admin/services")
      if (res.ok) {
        setServices(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setEditForm({
      name: service.name,
      duration: service.duration,
      price: service.price,
      category: service.category,
      isActive: service.isActive,
    })
  }

  const handleSave = async () => {
    if (!editingService) return

    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingService.id, ...editForm }),
      })

      if (res.ok) {
        setEditingService(null)
        fetchServices()
      }
    } catch (error) {
      console.error("Failed to update service:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const res = await fetch("/api/admin/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error("Failed to delete service:", error)
    }
  }

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.business.name.toLowerCase().includes(search.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-[#EFE9DA]">Services</h1>
          <p className="text-[#EFE9DA]/50 mt-1">{services.length} total services</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search services..."
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Business</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#EFE9DA]/60 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id} className="border-b border-[#263329]/50 hover:bg-[#141C18]">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-[#EFE9DA]">{service.name}</div>
                      <div className="text-xs text-[#EFE9DA]/50">{service.category}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#EFE9DA]/70">{service.business.name}</td>
                    <td className="px-4 py-3 text-sm text-[#EFE9DA]/70">{service.duration} min</td>
                    <td className="px-4 py-3 text-sm text-[#E8B547] font-medium">₹{service.price}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${service.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(service.id)}>
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
      {editingService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Name</label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#EFE9DA]/60 mb-1">Duration (min)</label>
                  <Input
                    type="number"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#EFE9DA]/60 mb-1">Price (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#EFE9DA]/60 mb-1">Category</label>
                <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
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
                <Button variant="primary" className="flex-1" onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" className="flex-1" onClick={() => setEditingService(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
