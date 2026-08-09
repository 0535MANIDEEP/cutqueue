export interface IndustryTemplate {
  slug: string
  name: string
  description: string
  category: string
  icon: string
  queueType: "ticket" | "appointment" | "slot" | "number"
  features: string[]
  defaultServices: { name: string; duration: number; price: number; category: string }[]
}

export const templates: IndustryTemplate[] = [
  {
    slug: "barbershop",
    name: "Barbershop",
    description: "Classic barbershop queue and booking management",
    category: "beauty",
    icon: "✂️",
    queueType: "ticket",
    features: ["queue", "booking", "portfolio", "analytics", "sms"],
    defaultServices: [
      { name: "Haircut", duration: 30, price: 25, category: "haircut" },
      { name: "Beard Trim", duration: 15, price: 15, category: "beard" },
      { name: "Fade + Beard", duration: 45, price: 35, category: "combo" },
      { name: "Kids Cut", duration: 20, price: 18, category: "kids" },
    ],
  },
  {
    slug: "hair-salon",
    name: "Hair Salon",
    description: "Full-service hair salon with stylist booking",
    category: "beauty",
    icon: "💇",
    queueType: "appointment",
    features: ["booking", "portfolio", "analytics", "sms", "stylist_profiles"],
    defaultServices: [
      { name: "Women's Haircut", duration: 45, price: 45, category: "cut" },
      { name: "Men's Haircut", duration: 30, price: 30, category: "cut" },
      { name: "Color", duration: 90, price: 80, category: "color" },
      { name: "Blowout", duration: 30, price: 35, category: "styling" },
      { name: "Highlights", duration: 120, price: 120, category: "color" },
    ],
  },
  {
    slug: "nail-studio",
    name: "Nail Studio",
    description: "Nail salon with chair-based booking",
    category: "beauty",
    icon: "💅",
    queueType: "slot",
    features: ["booking", "portfolio", "analytics", "sms"],
    defaultServices: [
      { name: "Manicure", duration: 30, price: 25, category: "nails" },
      { name: "Pedicure", duration: 45, price: 35, category: "nails" },
      { name: "Gel Nails", duration: 60, price: 45, category: "nails" },
      { name: "Nail Art", duration: 45, price: 40, category: "art" },
    ],
  },
  {
    slug: "tattoo-studio",
    name: "Tattoo Studio",
    description: "Tattoo artist queue and portfolio showcase",
    category: "beauty",
    icon: "🖋️",
    queueType: "appointment",
    features: ["booking", "portfolio", "analytics", "sms", "artist_profiles"],
    defaultServices: [
      { name: "Small Tattoo", duration: 60, price: 100, category: "tattoo" },
      { name: "Medium Tattoo", duration: 120, price: 200, category: "tattoo" },
      { name: "Large Tattoo", duration: 180, price: 350, category: "tattoo" },
      { name: "Touch Up", duration: 30, price: 50, category: "touchup" },
    ],
  },
  {
    slug: "dental-clinic",
    name: "Dental Clinic",
    description: "Patient queue management for dental offices",
    category: "healthcare",
    icon: "🦷",
    queueType: "number",
    features: ["queue", "booking", "analytics", "sms", "patient_records"],
    defaultServices: [
      { name: "Checkup", duration: 30, price: 100, category: "checkup" },
      { name: "Cleaning", duration: 45, price: 120, category: "cleaning" },
      { name: "Filling", duration: 60, price: 180, category: "procedure" },
      { name: "Root Canal", duration: 90, price: 800, category: "procedure" },
    ],
  },
  {
    slug: "medical-clinic",
    name: "Medical Clinic",
    description: "General practice patient queue management",
    category: "healthcare",
    icon: "🏥",
    queueType: "number",
    features: ["queue", "booking", "analytics", "sms", "patient_records"],
    defaultServices: [
      { name: "General Consultation", duration: 30, price: 100, category: "consultation" },
      { name: "Follow-up", duration: 15, price: 60, category: "consultation" },
      { name: "Physical Exam", duration: 45, price: 150, category: "exam" },
      { name: "Vaccination", duration: 15, price: 50, category: "procedure" },
    ],
  },
  {
    slug: "auto-repair",
    name: "Auto Repair Shop",
    description: "Vehicle service queue with status updates",
    category: "automotive",
    icon: "🔧",
    queueType: "ticket",
    features: ["queue", "booking", "analytics", "sms", "status_updates"],
    defaultServices: [
      { name: "Oil Change", duration: 30, price: 50, category: "maintenance" },
      { name: "Tire Rotation", duration: 30, price: 40, category: "maintenance" },
      { name: "Brake Service", duration: 60, price: 200, category: "repair" },
      { name: "Diagnostic", duration: 45, price: 100, category: "diagnostic" },
    ],
  },
  {
    slug: "fitness-center",
    name: "Fitness Center",
    description: "Class booking and equipment queue",
    category: "fitness",
    icon: "💪",
    queueType: "slot",
    features: ["booking", "analytics", "sms", "class_schedule"],
    defaultServices: [
      { name: "Personal Training", duration: 60, price: 80, category: "training" },
      { name: "Group Class", duration: 45, price: 25, category: "class" },
      { name: "Yoga Class", duration: 60, price: 20, category: "class" },
      { name: "Spin Class", duration: 45, price: 25, category: "class" },
    ],
  },
  {
    slug: "government-office",
    name: "Government Office",
    description: "Citizen queue management for government services",
    category: "government",
    icon: "🏛️",
    queueType: "number",
    features: ["queue", "analytics", "sms", "document_tracking"],
    defaultServices: [
      { name: "ID Application", duration: 30, price: 0, category: "document" },
      { name: "License Renewal", duration: 20, price: 0, category: "document" },
      { name: "Permit Application", duration: 45, price: 0, category: "document" },
      { name: "General Inquiry", duration: 15, price: 0, category: "inquiry" },
    ],
  },
  {
    slug: "bank-branch",
    name: "Bank Branch",
    description: "Customer queue management for banking services",
    category: "finance",
    icon: "🏦",
    queueType: "number",
    features: ["queue", "analytics", "sms", "service_desk"],
    defaultServices: [
      { name: "Account Services", duration: 30, price: 0, category: "account" },
      { name: "Loan Application", duration: 60, price: 0, category: "loan" },
      { name: "Investment Consultation", duration: 45, price: 0, category: "investment" },
      { name: "General Inquiry", duration: 15, price: 0, category: "inquiry" },
    ],
  },
  {
    slug: "vet-clinic",
    name: "Veterinary Clinic",
    description: "Pet queue management with owner notifications",
    category: "healthcare",
    icon: "🐾",
    queueType: "number",
    features: ["queue", "booking", "analytics", "sms", "pet_profiles"],
    defaultServices: [
      { name: "General Checkup", duration: 30, price: 75, category: "checkup" },
      { name: "Vaccination", duration: 15, price: 40, category: "procedure" },
      { name: "Surgery Consultation", duration: 45, price: 100, category: "consultation" },
      { name: "Emergency", duration: 60, price: 200, category: "emergency" },
    ],
  },
  {
    slug: "photography-studio",
    name: "Photography Studio",
    description: "Session booking and portfolio showcase",
    category: "creative",
    icon: "📸",
    queueType: "appointment",
    features: ["booking", "portfolio", "analytics", "sms", "gallery"],
    defaultServices: [
      { name: "Portrait Session", duration: 60, price: 150, category: "portrait" },
      { name: "Family Session", duration: 90, price: 200, category: "family" },
      { name: "Product Photography", duration: 120, price: 300, category: "product" },
      { name: "Event Coverage", duration: 180, price: 500, category: "event" },
    ],
  },
]

export function getTemplate(slug: string): IndustryTemplate | undefined {
  return templates.find((t) => t.slug === slug)
}

export function getTemplatesByCategory(category: string): IndustryTemplate[] {
  return templates.filter((t) => t.category === category)
}

export function getAllCategories(): string[] {
  return [...new Set(templates.map((t) => t.category))]
}
