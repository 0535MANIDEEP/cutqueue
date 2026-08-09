export type ServiceStatus = "configured" | "missing" | "placeholder"

export interface ServiceCheck {
  name: string
  status: ServiceStatus
  message: string
  required: boolean
}

function checkEnv(key: string, placeholderPatterns: string[] = []): ServiceStatus {
  const value = process.env[key]
  if (!value) return "missing"
  for (const pattern of placeholderPatterns) {
    if (value.includes(pattern)) return "placeholder"
  }
  return "configured"
}

export function checkStripe(): ServiceCheck {
  const status = checkEnv("STRIPE_SECRET_KEY", ["your-", "placeholder", "sk_xxx"])
  return {
    name: "Stripe",
    status,
    message: status === "configured"
      ? "Stripe is ready for payments"
      : "Stripe is NOT configured. Payments will be disabled. To enable: Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env",
    required: false,
  }
}

export function checkTwilio(): ServiceCheck {
  const status = checkEnv("TWILIO_ACCOUNT_SID", ["your-", "placeholder", "ACxxx"])
  return {
    name: "Twilio SMS",
    status,
    message: status === "configured"
      ? "Twilio SMS is ready"
      : "Twilio SMS is NOT configured. SMS notifications disabled. To enable: Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env",
    required: false,
  }
}

export function checkEmail(): ServiceCheck {
  const status = checkEnv("RESEND_API_KEY", ["your-", "placeholder", "re_xxx"])
  return {
    name: "Email (Resend)",
    status,
    message: status === "configured"
      ? "Email service is ready"
      : "Email service is NOT configured. Email notifications disabled. To enable: Set RESEND_API_KEY in .env",
    required: false,
  }
}

export function checkGemini(): ServiceCheck {
  const status = checkEnv("GEMINI_API_KEY", ["your-", "placeholder"])
  return {
    name: "Gemini AI",
    status,
    message: status === "configured"
      ? "Gemini AI is ready for automation"
      : "Gemini AI is NOT configured. AI features disabled. To enable: Set GEMINI_API_KEY in .env",
    required: false,
  }
}

export function checkDatabase(): ServiceCheck {
  const status = checkEnv("DATABASE_URL", ["[YOUR-", "placeholder", "[YOUR-PASSWORD]"])
  return {
    name: "Database (Supabase)",
    status,
    message: status === "configured"
      ? "Database is connected"
      : "Database is NOT configured. NOTHING will work. Set DATABASE_URL in .env with your Supabase connection string",
    required: true,
  }
}

export function checkN8N(): ServiceCheck {
  const status = checkEnv("N8N_API_KEY", ["your-", "placeholder"])
  return {
    name: "n8n Automation",
    status,
    message: status === "configured"
      ? "n8n automation is ready"
      : "n8n is NOT configured. SMS automation disabled. To enable: Set N8N_API_KEY and N8N_WEBHOOK_URL in .env",
    required: false,
  }
}

export function getAllServiceChecks(): ServiceCheck[] {
  return [
    checkDatabase(),
    checkStripe(),
    checkTwilio(),
    checkEmail(),
    checkGemini(),
    checkN8N(),
  ]
}

export function getMissingServices(): ServiceCheck[] {
  return getAllServiceChecks().filter((s) => s.status !== "configured")
}

export function getRequiredMissing(): ServiceCheck[] {
  return getAllServiceChecks().filter((s) => s.required && s.status !== "configured")
}

export function isStripeConfigured(): boolean {
  return checkStripe().status === "configured"
}

export function isTwilioConfigured(): boolean {
  return checkTwilio().status === "configured"
}

export function isEmailConfigured(): boolean {
  return checkEmail().status === "configured"
}

export function isGeminiConfigured(): boolean {
  return checkGemini().status === "configured"
}

export function isN8NConfigured(): boolean {
  return checkN8N().status === "configured"
}

export async function getBusinessServiceChecks(businessId: string): Promise<ServiceCheck[]> {
  const { getBusinessCredentials, hasTwilioCredentials, hasResendCredentials, hasStripeCredentials } = await import("./business-credentials")
  const creds = await getBusinessCredentials(businessId)

  return [
    {
      name: "Twilio SMS",
      status: hasTwilioCredentials(creds) ? "configured" : "missing",
      message: hasTwilioCredentials(creds)
        ? "Twilio SMS is ready (using your credentials)"
        : "Twilio SMS not configured. SMS notifications disabled. Configure in Settings → SMS Notifications.",
      required: false,
    },
    {
      name: "Email (Resend)",
      status: hasResendCredentials(creds) ? "configured" : "missing",
      message: hasResendCredentials(creds)
        ? "Email service is ready (using your credentials)"
        : "Email service not configured. Email notifications disabled. Configure in Settings → Email Notifications.",
      required: false,
    },
    {
      name: "Stripe Payments",
      status: hasStripeCredentials(creds) ? "configured" : "missing",
      message: hasStripeCredentials(creds)
        ? "Stripe is ready for payments (using your credentials)"
        : "Stripe not configured. Payments disabled. Configure in Settings → Payments.",
      required: false,
    },
  ]
}
