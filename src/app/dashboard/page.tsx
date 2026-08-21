"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { getDashboardPath } from "@/lib/roles"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role as "CUSTOMER" | "STAFF" | "BUSINESS_OWNER" | "ADMIN"

      if (role === "BUSINESS_OWNER") {
        fetch("/api/business/settings")
          .then((res) => {
            if (!res.ok) throw new Error("No business")
            return res.json()
          })
          .then((data) => {
            if (data.error) {
              router.push("/onboarding")
            } else {
              router.push("/dashboard/owner")
            }
          })
          .catch(() => {
            router.push("/onboarding")
          })
        return
      }

      const path = getDashboardPath(role)
      router.push(path)
    }
  }, [status, session, router])

  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center">
      <div className="text-[#EFE9DA]/50">Redirecting...</div>
    </div>
  )
}
