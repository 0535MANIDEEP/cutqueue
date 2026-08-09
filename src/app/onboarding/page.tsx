"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { templates } from "@/lib/templates"

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [templateSlug, setTemplateSlug] = useState("barbershop")

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center">
        <div className="text-[#EFE9DA]/50">Loading...</div>
      </div>
    )
  }

  const selectedTemplate = templates.find((t) => t.slug === templateSlug)

  const handleCreate = async () => {
    if (!businessName.trim()) {
      setError("Business name is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/onboarding/create-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, templateSlug }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create business")
        setLoading(false)
        return
      }

      router.push("/dashboard/owner")
      router.refresh()
    } catch {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const steps = [
    {
      title: "Pick your industry",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {templates.map((t) => (
            <button
              key={t.slug}
              onClick={() => setTemplateSlug(t.slug)}
              className={`p-4 rounded-lg border text-left transition-all ${
                templateSlug === t.slug
                  ? "border-[#E8B547] bg-[#E8B547]/10"
                  : "border-[#263329] bg-[#141C18] hover:border-[#E8B547]/50"
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <p className="text-sm font-medium text-[#EFE9DA] mt-2">{t.name}</p>
              <p className="text-xs text-[#EFE9DA]/40 mt-1">{t.description}</p>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Name your business",
      content: (
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Sharp Edgez Barbershop"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          {selectedTemplate && (
            <div className="p-4 rounded-lg bg-[#141C18] border border-[#263329]">
              <p className="text-sm text-[#EFE9DA]/60 mb-2">We&apos;ll set up:</p>
              <ul className="space-y-1">
                {selectedTemplate.defaultServices.map((s) => (
                  <li key={s.name} className="text-sm text-[#EFE9DA]">
                    {s.name} — ${s.price} ({s.duration} min)
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[#EFE9DA]/40 mt-3">
                You can edit these later in Settings
              </p>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#E8B547] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#0A0F0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-[#EFE9DA]">
              Queue<span className="text-[#E8B547]">Forge</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[#EFE9DA] mb-2">Set up your business</h1>
          <p className="text-[#EFE9DA]/50">Two steps and you&apos;re live</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= step ? "w-12 bg-[#E8B547]" : "w-8 bg-[#263329]"
              }`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <h2 className="text-lg font-bold text-[#EFE9DA] mb-4">{steps[step].title}</h2>
            {steps[step].content}

            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => setStep(step + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleCreate}
                  disabled={loading || !businessName.trim()}
                >
                  {loading ? "Creating..." : "Launch Business"}
                </Button>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-[#EFE9DA]/30">
              <Link href="/dashboard/owner" className="hover:text-[#EFE9DA]/50">
                Skip for now
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
