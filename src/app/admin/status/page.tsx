"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ServiceCheck {
  name: string
  status: "configured" | "missing" | "placeholder"
  message: string
  required: boolean
}

export default function AdminStatusPage() {
  const [services, setServices] = useState<ServiceCheck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/status")
      if (res.ok) {
        const data = await res.json()
        setServices(data.services)
      }
    } catch (error) {
      console.error("Failed to fetch status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#EFE9DA]/50">Loading...</div>
      </div>
    )
  }

  const statusConfig = {
    configured: { color: "bg-green-500/10 text-green-400 border-green-500/30", icon: "✓", label: "Active" },
    missing: { color: "bg-red-500/10 text-red-400 border-red-500/30", icon: "✗", label: "Not Configured" },
    placeholder: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: "⚠", label: "Placeholder" },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#EFE9DA]">Service Status</h1>
        <p className="text-[#EFE9DA]/50 mt-1">Monitor external service configurations and costs</p>
      </div>

      {/* Warning Banner */}
      {services.some((s) => s.status !== "configured" && s.required) && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2 text-red-400 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Required services are missing. The platform cannot function properly.
          </div>
        </div>
      )}

      {/* Cost Warning */}
      <div className="p-4 rounded-lg bg-[#E8B547]/10 border border-[#E8B547]/30">
        <div className="flex items-center gap-2 text-[#E8B547] font-medium mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Cost Guardrails Active
        </div>
        <p className="text-sm text-[#EFE9DA]/60">
          All paid services (Stripe, Twilio, Email) require explicit API key configuration.
          If a service is not configured, the feature is disabled — no charges will occur.
          Configure only what you need.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {services.map((service) => {
          const config = statusConfig[service.status]
          return (
            <Card key={service.name}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[#EFE9DA]">{service.name}</h3>
                    {service.required && (
                      <span className="text-xs text-red-400">Required</span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${config.color}`}>
                    {config.icon} {config.label}
                  </span>
                </div>
                <p className="text-sm text-[#EFE9DA]/50">{service.message}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-[#EFE9DA] mb-2">Required (must configure)</h4>
              <div className="p-3 rounded-lg bg-[#0A0F0D] font-mono text-xs text-[#EFE9DA]/70">
                <div>DATABASE_URL="postgresql://..."</div>
                <div>NEXTAUTH_SECRET="your-secret-here"</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#EFE9DA] mb-2">Optional - Payments</h4>
              <div className="p-3 rounded-lg bg-[#0A0F0D] font-mono text-xs text-[#EFE9DA]/70">
                <div>STRIPE_SECRET_KEY="sk_..."</div>
                <div>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#EFE9DA] mb-2">Optional - SMS (Twilio)</h4>
              <div className="p-3 rounded-lg bg-[#0A0F0D] font-mono text-xs text-[#EFE9DA]/70">
                <div>TWILIO_ACCOUNT_SID="AC..."</div>
                <div>TWILIO_AUTH_TOKEN="..."</div>
                <div>TWILIO_PHONE_NUMBER="+1..."</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#EFE9DA] mb-2">Optional - Email (Resend)</h4>
              <div className="p-3 rounded-lg bg-[#0A0F0D] font-mono text-xs text-[#EFE9DA]/70">
                <div>RESEND_API_KEY="re_..."</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
