import { prisma } from "./prisma"

export interface BusinessCredentials {
  twilio: {
    accountSid: string
    authToken: string
    phoneNumber: string
  } | null
  resend: {
    apiKey: string
  } | null
  stripe: {
    secretKey: string
    publishableKey: string
  } | null
}

export async function getBusinessCredentials(businessId: string): Promise<BusinessCredentials> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { settings: true },
  })

  if (!business?.settings) {
    return { twilio: null, resend: null, stripe: null }
  }

  const settings = business.settings as Record<string, unknown>
  const credentials = settings.credentials as Record<string, unknown> | undefined

  if (!credentials) {
    return { twilio: null, resend: null, stripe: null }
  }

  return {
    twilio: credentials.twilio as BusinessCredentials["twilio"] || null,
    resend: credentials.resend as BusinessCredentials["resend"] || null,
    stripe: credentials.stripe as BusinessCredentials["stripe"] || null,
  }
}

export async function saveBusinessCredentials(
  businessId: string,
  credentials: Partial<BusinessCredentials>
): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { settings: true },
  })

  const currentSettings = (business?.settings as Record<string, unknown>) || {}
  const currentCredentials = (currentSettings.credentials as Record<string, unknown>) || {}

  await prisma.business.update({
    where: { id: businessId },
    data: {
      settings: {
        ...currentSettings,
        credentials: {
          ...currentCredentials,
          ...credentials,
        },
      } as never,
    },
  })
}

export function hasTwilioCredentials(creds: BusinessCredentials): boolean {
  return !!(creds.twilio?.accountSid && creds.twilio?.authToken && creds.twilio?.phoneNumber)
}

export function hasResendCredentials(creds: BusinessCredentials): boolean {
  return !!(creds.resend?.apiKey)
}

export function hasStripeCredentials(creds: BusinessCredentials): boolean {
  return !!(creds.stripe?.secretKey && creds.stripe?.publishableKey)
}
