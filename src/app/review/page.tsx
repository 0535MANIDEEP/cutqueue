"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ReviewPage() {
  const searchParams = useSearchParams()
  const businessId = searchParams.get("business")
  const bookingId = searchParams.get("booking")

  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [businessName, setBusinessName] = useState("")

  useEffect(() => {
    if (businessId) {
      fetch(`/api/shops?slug=${businessId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.business) setBusinessName(d.business.name)
        })
        .catch(() => {})
    }
  }, [businessId])

  const handleSubmit = async () => {
    if (!rating || !businessId) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          bookingId: bookingId || undefined,
          rating,
          comment: comment || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to submit review")
        return
      }
      setSubmitted(true)
    } catch {
      setError("Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
          <p className="text-gray-500 mb-6">Your review helps us improve.</p>
          <Link href="/" className="text-blue-600 font-medium hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">How was your experience?</h1>
        <p className="text-gray-500 text-center mb-6">Your feedback helps us serve you better</p>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm text-center">{error}</div>
        )}

        {/* Star Rating */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
            >
              <svg
                className={`w-10 h-10 ${
                  star <= (hoveredRating || rating) ? "text-yellow-400" : "text-gray-200"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-sm text-gray-500 mb-4">
            {rating <= 2 ? "We're sorry to hear that" : rating === 3 ? "It was okay" : rating === 4 ? "Great!" : "Excellent!"}
          </p>
        )}

        {/* Comment */}
        <div className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more (optional)..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            aria-label="Review comment"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!rating || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  )
}
