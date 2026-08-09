"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
    isBarber: false,
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
        body: JSON.stringify(formData),
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
        router.push(formData.isBarber ? "/dashboard" : "/")
        router.refresh()
      }
    } catch {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" })
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
                  id="isBarber"
                  checked={formData.isBarber}
                  onChange={(e) => setFormData({ ...formData, isBarber: e.target.checked })}
                  className="w-4 h-4 rounded border-[#263329] bg-[#0A0F0D] text-[#E8B547] focus:ring-[#E8B547]"
                />
                <label htmlFor="isBarber" className="text-sm text-[#EFE9DA]">
                  I&apos;m a barber / shop owner
                </label>
              </div>

              {formData.isBarber && (
                <div>
                  <label className="block text-sm font-medium text-[#EFE9DA] mb-2">
                    Shop Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Sharp Edgez Barbershop"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  />
                </div>
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#EFE9DA] mb-2">
                  Phone (optional)
                </label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                />
                <p className="mt-1 text-xs text-[#EFE9DA]/40">At least 8 characters</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#263329]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#141C18] text-[#EFE9DA]/40">or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>

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
