"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link")
      return
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (res.ok) {
          setStatus("success")
          setMessage("Email verified successfully!")
        } else {
          setStatus("error")
          setMessage(data.error || "Verification failed")
        }
      } catch {
        setStatus("error")
        setMessage("An error occurred")
      }
    }

    verify()
  }, [token])

  return (
    <Card className="max-w-md w-full">
      <CardContent className="text-center p-8">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#E8B547]/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-[#E8B547]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#EFE9DA] mb-2">Verifying...</h2>
            <p className="text-[#EFE9DA]/50">Please wait while we verify your email.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#EFE9DA] mb-2">{message}</h2>
            <p className="text-[#EFE9DA]/50 mb-6">You can now access all features.</p>
            <Link href="/auth/signin">
              <Button variant="primary">Sign In</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#EFE9DA] mb-2">Verification Failed</h2>
            <p className="text-[#EFE9DA]/50 mb-6">{message}</p>
            <Link href="/auth/signin">
              <Button variant="outline">Back to Sign In</Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center">
          <div className="text-[#EFE9DA]/50">Loading...</div>
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
    </div>
  )
}
