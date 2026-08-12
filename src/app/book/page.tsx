"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  category: string
}

interface Staff {
  id: string
  name: string | null
  image: string | null
  rating: number
  specialties: string[]
}

interface Business {
  id: string
  name: string
  slug: string
  address: string
  city: string
  openingHours: Record<string, { open: string; close: string; closed?: boolean }> | null
  template?: {
    name: string
    icon: string
    slug: string
  }
}

function generateTimeSlots(open: string, close: string, duration: number): string[] {
  const slots: string[] = []
  const [openH, openM] = open.split(":").map(Number)
  const [closeH, closeM] = close.split(":").map(Number)
  const startMinutes = openH * 60 + openM
  const endMinutes = closeH * 60 + closeM

  for (let m = startMinutes; m + duration <= endMinutes; m += 30) {
    const h = Math.floor(m / 60)
    const min = m % 60
    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`)
  }
  return slots
}

export default function BookPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBusinesses()
  }, [])

  useEffect(() => {
    if (selectedBusiness) {
      fetchServices(selectedBusiness)
      fetchStaff(selectedBusiness)
      setSelectedService(null)
      setSelectedStaff(null)
      setSelectedTime("")
    }
  }, [selectedBusiness])

  useEffect(() => {
    setSelectedTime("")
  }, [selectedDate, selectedService])

  const fetchBusinesses = async () => {
    const res = await fetch("/api/shops")
    if (res.ok) {
      setBusinesses(await res.json())
    }
  }

  const fetchServices = async (businessId: string) => {
    const res = await fetch(`/api/services?businessId=${businessId}`)
    if (res.ok) {
      setServices(await res.json())
    }
  }

  const fetchStaff = async (businessId: string) => {
    try {
      const res = await fetch(`/api/staff?businessId=${businessId}`)
      if (res.ok) {
        setStaffList(await res.json())
      }
    } catch {
      setStaffList([])
    }
  }

  const selectedBiz = businesses.find((b) => b.id === selectedBusiness)
  const selectedSvc = services.find((s) => s.id === selectedService)

  const getTimeSlots = (): string[] => {
    if (!selectedBiz?.openingHours || !selectedDate) {
      return ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"]
    }

    const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
    const day = dayNames[new Date(selectedDate).getDay()]
    const hours = selectedBiz.openingHours[day]

    if (!hours || hours.closed) {
      return ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"]
    }

    const duration = selectedSvc?.duration || 30
    return generateTimeSlots(hours.open, hours.close, duration)
  }

  const handleBooking = async () => {
    if (!selectedBusiness || !selectedService || !selectedDate || !selectedTime) return

    setLoading(true)
    setError("")
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`)

      let staffId = selectedStaff
      if (!staffId && staffList.length > 0) {
        staffId = staffList[0].id
      }

      if (!staffId) {
        setError("No staff available for this business. Please try another business.")
        setLoading(false)
        return
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: selectedBusiness,
          serviceId: selectedService,
          staffId,
          scheduledAt: scheduledAt.toISOString(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Booking failed. Please try again.")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#EFE9DA] mb-2">Booking Confirmed!</h2>
            <p className="text-[#EFE9DA]/50 mb-6">
              You&apos;ll receive a confirmation shortly.
            </p>
            <Button variant="primary" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0F0D] pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#EFE9DA] mb-8">Book an Appointment</h1>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Business</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {businesses.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => setSelectedBusiness(biz.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedBusiness === biz.id
                        ? "border-[#E8B547] bg-[#E8B547]/10"
                        : "border-[#263329] bg-[#141C18] hover:border-[#E8B547]/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {biz.template && (
                        <span className="text-2xl">{biz.template.icon}</span>
                      )}
                      <div>
                        <div className="font-semibold text-[#EFE9DA]">{biz.name}</div>
                        <div className="text-sm text-[#EFE9DA]/50">
                          {biz.address}, {biz.city}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {businesses.length === 0 && (
                  <p className="text-[#EFE9DA]/40 text-sm">No businesses available yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedBusiness && (
            <Card>
              <CardHeader>
                <CardTitle>Select Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedService === service.id
                          ? "border-[#E8B547] bg-[#E8B547]/10"
                          : "border-[#263329] bg-[#141C18] hover:border-[#E8B547]/30"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-[#EFE9DA]">{service.name}</div>
                          <div className="text-sm text-[#EFE9DA]/50">{service.duration} min</div>
                          {service.description && (
                            <div className="text-xs text-[#EFE9DA]/40 mt-1">{service.description}</div>
                          )}
                        </div>
                        <div className="text-[#E8B547] font-semibold">${service.price}</div>
                      </div>
                    </button>
                  ))}
                  {services.length === 0 && (
                    <p className="text-[#EFE9DA]/40 text-sm">No services available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedBusiness && selectedService && staffList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Stylist (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {staffList.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => setSelectedStaff(staff.id === selectedStaff ? null : staff.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedStaff === staff.id
                          ? "border-[#E8B547] bg-[#E8B547]/10"
                          : "border-[#263329] bg-[#141C18] hover:border-[#E8B547]/30"
                      }`}
                    >
                      <div className="font-medium text-sm text-[#EFE9DA]">{staff.name || "Stylist"}</div>
                      {staff.rating > 0 && (
                        <div className="text-xs text-[#E8B547] mt-1">
                          {"★".repeat(Math.round(staff.rating))} {staff.rating.toFixed(1)}
                        </div>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedStaff(null)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedStaff === null
                        ? "border-[#E8B547] bg-[#E8B547]/10"
                        : "border-[#263329] bg-[#141C18] hover:border-[#E8B547]/30"
                    }`}
                  >
                    <div className="font-medium text-sm text-[#EFE9DA]">Any available</div>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedService && (
            <Card>
              <CardHeader>
                <CardTitle>Select Date & Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#EFE9DA]/60 mb-2">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full p-3 rounded-lg bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#EFE9DA]/60 mb-2">Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full p-3 rounded-lg bg-[#0A0F0D] border border-[#263329] text-[#EFE9DA]"
                    >
                      <option value="">Select time</option>
                      {getTimeSlots().map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedService && selectedDate && selectedTime && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleBooking}
              disabled={loading}
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
