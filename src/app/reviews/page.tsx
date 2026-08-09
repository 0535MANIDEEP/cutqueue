'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  comment?: string
  isVerified: boolean
  createdAt: string
  customer: { name: string; image?: string }
  staff?: { user: { name: string } }
}

export default function ReviewsPage() {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ rating: 5, comment: '', staffId: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/shops')
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setBusinessId(data[0].id)
          fetchReviews(data[0].id)
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [])

  const fetchReviews = async (bizId: string) => {
    try {
      const res = await fetch(`/api/reviews?businessId=${bizId}`)
      if (res.ok) setReviews(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const submitReview = async () => {
    if (!businessId) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, ...formData }),
      })
      if (res.ok) {
        setShowForm(false)
        setFormData({ rating: 5, comment: '', staffId: '' })
        fetchReviews(businessId)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-[#0F1B17] pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#EFE9DA]">Reviews</h1>
            <p className="text-[#EFE9DA]/50 mt-1">{reviews.length} reviews • {avgRating} avg</p>
          </div>
          {session?.user && (
            <Button variant="primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Write Review'}
            </Button>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm text-[#EFE9DA]/60 mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={cn(
                        'text-2xl transition-colors',
                        star <= formData.rating ? 'text-[#E8B547]' : 'text-[#2A3F3A]'
                      )}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-[#EFE9DA]/60 mb-2 block">Comment (optional)</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E2E29] border border-[#2A3F3A] text-[#EFE9DA] placeholder:text-[#EFE9DA]/30 focus:outline-none focus:border-[#E8B547] min-h-[100px]"
                  placeholder="How was your experience?"
                />
              </div>
              <Button variant="primary" onClick={submitReview} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12 text-[#EFE9DA]/50">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#EFE9DA]/60">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2A3F3A] flex items-center justify-center text-[#EFE9DA] font-medium">
                        {review.customer.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-[#EFE9DA]">
                          {review.customer.name}
                          {review.isVerified && (
                            <span className="ml-2 text-xs text-green-400">✓ Verified</span>
                          )}
                        </div>
                        <div className="text-sm text-[#EFE9DA]/50">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= review.rating ? 'text-[#E8B547]' : 'text-[#2A3F3A]'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-[#EFE9DA]/70">{review.comment}</p>
                  )}
                  {review.staff && (
                    <p className="text-sm text-[#EFE9DA]/40 mt-2">
                      Staff: {review.staff.user.name}
                    </p>
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
