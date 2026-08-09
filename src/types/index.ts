import type {
  User,
  Business,
  Staff,
  Service,
  StaffService,
  Booking,
  Queue,
  QueueEntry,
  PortfolioImage,
  Review,
  CustomerPoints,
  Reward,
  Referral,
  Notification,
  IndustryTemplate,
  ApiKey,
  Webhook,
} from '../generated/prisma/client'

export type {
  User,
  Business,
  Staff,
  Service,
  StaffService,
  Booking,
  Queue,
  QueueEntry,
  PortfolioImage,
  Review,
  CustomerPoints,
  Reward,
  Referral,
  Notification,
  IndustryTemplate,
  ApiKey,
  Webhook,
}

export type UserRole = 'CUSTOMER' | 'STAFF' | 'BUSINESS_OWNER' | 'ADMIN'

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type QueueStatus = 'WAITING' | 'CALLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'

export interface TimeSlot {
  time: string
  available: boolean
  staffId?: string
}

export interface DayHours {
  open: string
  close: string
  closed?: boolean
}

export interface OpeningHours {
  mon: DayHours
  tue: DayHours
  wed: DayHours
  thu: DayHours
  fri: DayHours
  sat: DayHours
  sun: DayHours
}

export interface QueueState {
  id: string
  currentNumber: number
  estimatedWait: number
  entries: QueueEntry[]
  position?: number
}
