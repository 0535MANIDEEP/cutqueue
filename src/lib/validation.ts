import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  phone: z.string().max(20).optional(),
  shopName: z.string().min(1).max(100).optional(),
  templateSlug: z.string().max(50).optional(),
})

export const bookingSchema = z.object({
  staffId: z.string().min(1),
  serviceId: z.string().min(1),
  businessId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
})

export const queueJoinSchema = z.object({
  businessId: z.string().min(1),
  serviceType: z.string().max(50).optional(),
  guestName: z.string().max(100).optional(),
  guestPhone: z.string().max(20).optional(),
})

export const queueActionSchema = z.object({
  action: z.enum(["call", "start", "complete", "cancel"]),
})

export const serviceSchema = z.object({
  businessId: z.string().min(1).optional(),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  duration: z.number().int().min(5).max(480),
  price: z.number().min(0).max(10000),
  category: z.string().min(1).max(50),
})

export const reviewSchema = z.object({
  businessId: z.string().min(1),
  staffId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
  bookingId: z.string().optional(),
})

export const complaintSchema = z.object({
  businessId: z.string().min(1),
  bookingId: z.string().optional(),
  category: z.enum([
    "SERVICE_QUALITY",
    "WAIT_TIME",
    "STAFF_BEHAVIOR",
    "PRICING",
    "CLEANLINESS",
    "OTHER",
  ]),
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
})

export const announcementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  type: z.enum(["GENERAL", "PROMOTION", "CLOSURE", "HOLIDAY", "EVENT"]).optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
})

export const notificationMarkReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1).max(100),
})

export const businessSettingsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  openingHours: z.record(z.string(), z.unknown()).optional(),
  credentials: z
    .object({
      twilio: z
        .object({
          accountSid: z.string().max(50),
          authToken: z.string().max(50),
          phoneNumber: z.string().max(20),
        })
        .nullable()
        .optional(),
      resend: z
        .object({
          apiKey: z.string().max(100),
        })
        .nullable()
        .optional(),
      stripe: z
        .object({
          secretKey: z.string().max(100),
          publishableKey: z.string().max(100),
        })
        .nullable()
        .optional(),
    })
    .optional(),
})

export const staffScheduleSchema = z.object({
  isAvailable: z.boolean(),
})

export const onboardingSchema = z.object({
  businessName: z.string().min(1).max(100),
  templateSlug: z.string().min(1).max(50),
})
