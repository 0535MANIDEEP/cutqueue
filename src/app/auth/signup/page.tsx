"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { templates } from "@/lib/templates"

export default function SignUpPage() {
  const router = useRouter()
  const [isOwner, setIsOwner] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    templateSlug: "barbershop",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          shopName: isOwner ? formData.businessName : undefined,
          templateSlug: isOwner ? formData.templateSlug : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create account")
        setLoading(false)
        return
      }

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.error) {
        setError("Account created but sign-in failed. Please try signing in.")
        setLoading(false)
      } else {
        router.push(isOwner ? "/dashboard/owner" : "/dashboard/customer")
        router.refresh()
      }
    } catch {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
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
          <h1 className="text-2xl font-bold text-[#EFE9DA] mb-2">Create your account</h1>
          <p className="text-[#EFE9DA]/50">Start managing your queue today</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0D] border border-[#263329]">
                <input
                  type="checkbox"
                  id="isOwner"
                  checked={isOwner}
                  onChange={(e) => setIsOwner(e.target.checked)}
                  className="w-4 h-4 rounded border-[#263329] bg-[#0A0F0D] text-[#E8B547] focus:ring-[#E8B547]"
                />
                <label htmlFor="isOwner" className="text-sm text-[#EFE9DA]">
                  I own a business
                </label>
              </div>

              {isOwner && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#EFE9DA] mb-2">
                      Business Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Your Shop Name"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required={isOwner}
                      aria-label="Business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#EFE9DA] mb-2">
                      Industry
                    </label>
                    <select
                      value={formData.templateSlug}
                      onChange={(e) => setFormData({ ...formData, templateSlug: e.target.value })}
                      className="w-full rounded-lg bg-[#0F1B17] border border-[#2A3F3A] px-4 py-3 text-[#EFE9DA] focus:outline-none focus:ring-2 focus:ring-[#E8B547]/50 focus:border-[#E8B547] transition-all duration-200"
                      aria-label="Industry"
                    >
                      {templates.map((t) => (
                        <option key={t.slug} value={t.slug}>
                          {t.icon} {t.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-[#EFE9DA]/40">
                      We&apos;ll pre-fill services and settings for your industry
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-[#EFE9DA] mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  aria-label="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#EFE9DA] mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  aria-label="Email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#EFE9DA] mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  aria-label="Password"
                />
                <p className="mt-1 text-xs text-[#EFE9DA]/40">At least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#EFE9DA] mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  aria-label="Phone number"
                />
                <p className="mt-1 text-xs text-[#EFE9DA]/40">For SMS notifications (optional)</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : isOwner
                    ? "Create Account & Business"
                    : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#EFE9DA]/50">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-[#E8B547] hover:text-[#E8B547]/80">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
