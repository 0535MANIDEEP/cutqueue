"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  category: string
  isActive: boolean
}

export default function OwnerServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    category: "General",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services")
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } catch {
      setError("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.name.trim()) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to add service")
        return
      }
      setShowAdd(false)
      setFormData({ name: "", description: "", duration: 30, price: 0, category: "General" })
      fetchServices()
    } catch {
      setError("Failed to add service")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      })
      if (res.ok) fetchServices()
    } catch {
      setError("Failed to update service")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <Button variant="primary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? "Cancel" : "+ Add Service"}
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-bold">×</button>
          </div>
        )}

        {showAdd && (
          <Card className="mb-6">
            <CardContent className="p-4 space-y-3">
              <Input
                type="text"
                placeholder="Service name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                aria-label="Service name"
              />
              <Input
                type="text"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                aria-label="Description"
              />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min)</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                    min={5}
                    max={480}
                    aria-label="Duration in minutes"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price (₹)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    min={0}
                    aria-label="Price in rupees"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <Input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    aria-label="Category"
                  />
                </div>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleAdd}
                disabled={saving || !formData.name.trim()}
              >
                {saving ? "Adding..." : "Add Service"}
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-500 mb-4">No services yet</p>
            <Button variant="primary" onClick={() => setShowAdd(true)}>
              Add your first service
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className={`bg-white border rounded-xl p-4 flex items-center justify-between ${
                  service.isActive ? "border-gray-100" : "border-gray-200 opacity-60"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{service.name}</p>
                    {!service.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Hidden</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {service.duration} min · ₹{service.price} · {service.category}
                  </p>
                  {service.description && (
                    <p className="text-xs text-gray-400 mt-1">{service.description}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleActive(service)}
                  className={`text-sm font-medium px-3 py-1 rounded-lg transition ${
                    service.isActive
                      ? "text-red-600 hover:bg-red-50"
                      : "text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {service.isActive ? "Hide" : "Show"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
