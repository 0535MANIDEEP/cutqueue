'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Complaint {
  id: string
  category: string
  subject: string
  description: string
  status: string
  priority: string
  response?: string
  createdAt: string
  customer: { name: string; email: string }
  business: { name: string }
}

const categoryLabels: Record<string, string> = {
  SERVICE_QUALITY: 'Service Quality',
  WAIT_TIME: 'Wait Time',
  STAFF_BEHAVIOR: 'Staff Behavior',
  PRICING: 'Pricing',
  CLEANLINESS: 'Cleanliness',
  OTHER: 'Other',
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  RESOLVED: 'bg-green-500/10 text-green-400 border-green-500/30',
  DISMISSED: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
}

export default function ComplaintsPage() {
  const { data: session } = useSession()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [businessId, setBusinessId] = useState('')
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([])
  const [formData, setFormData] = useState({
    category: 'SERVICE_QUALITY',
    subject: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const isOwner = session?.user?.role === 'BUSINESS_OWNER'
  const isAdmin = session?.user?.role === 'ADMIN'

  useEffect(() => {
    fetchBusinesses()
    fetchComplaints()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/shops')
      if (res.ok) {
        const data = await res.json()
        setBusinesses(data)
        if (data.length > 0) setBusinessId(data[0].id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints')
      if (res.ok) setComplaints(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const submitComplaint = async () => {
    if (!businessId || !formData.subject || !formData.description) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, ...formData }),
      })
      if (res.ok) {
        setShowForm(false)
        setFormData({ category: 'SERVICE_QUALITY', subject: '', description: '' })
        fetchComplaints()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const respondToComplaint = async (complaintId: string, response: string, status: string) => {
    try {
      const res = await fetch('/api/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId, response, status }),
      })
      if (res.ok) fetchComplaints()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1B17] pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#EFE9DA]">Complaints</h1>
            <p className="text-[#EFE9DA]/50 mt-1">
              {complaints.length} total • {complaints.filter((c) => c.status === 'OPEN').length} open
            </p>
          </div>
          {!isOwner && !isAdmin && session?.user && (
            <Button variant="primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'File Complaint'}
            </Button>
          )}
        </div>

        {/* Complaint Form */}
        {showForm && (
          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm text-[#EFE9DA]/60 mb-2 block">Business</label>
                <select
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1E2E29] border border-[#2A3F3A] text-[#EFE9DA] focus:outline-none focus:border-[#E8B547]"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[#EFE9DA]/60 mb-2 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1E2E29] border border-[#2A3F3A] text-[#EFE9DA] focus:outline-none focus:border-[#E8B547]"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[#EFE9DA]/60 mb-2 block">Subject</label>
                <input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1E2E29] border border-[#2A3F3A] text-[#EFE9DA] placeholder:text-[#EFE9DA]/30 focus:outline-none focus:border-[#E8B547]"
                  placeholder="Brief summary"
                />
              </div>
              <div>
                <label className="text-sm text-[#EFE9DA]/60 mb-2 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E2E29] border border-[#2A3F3A] text-[#EFE9DA] placeholder:text-[#EFE9DA]/30 focus:outline-none focus:border-[#E8B547] min-h-[120px]"
                  placeholder="Describe the issue in detail"
                />
              </div>
              <Button variant="primary" onClick={submitComplaint} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Complaints List */}
        {loading ? (
          <div className="text-center py-12 text-[#EFE9DA]/50">Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#EFE9DA]/60">No complaints filed yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-[#EFE9DA]/40">
                          {categoryLabels[complaint.category] || complaint.category}
                        </span>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs border',
                          statusColors[complaint.status]
                        )}>
                          {complaint.status}
                        </span>
                      </div>
                      <h3 className="font-medium text-[#EFE9DA]">{complaint.subject}</h3>
                    </div>
                    <span className="text-xs text-[#EFE9DA]/40">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[#EFE9DA]/60 mb-3">{complaint.description}</p>
                  <div className="text-xs text-[#EFE9DA]/40">
                    {complaint.customer.name} • {complaint.business.name}
                  </div>
                  {complaint.response && (
                    <div className="mt-4 p-3 rounded-lg bg-[#1E2E29] border border-[#2A3F3A]">
                      <p className="text-xs text-[#E8B547] mb-1">Response:</p>
                      <p className="text-sm text-[#EFE9DA]/70">{complaint.response}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
