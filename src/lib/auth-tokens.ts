import { prisma } from "./prisma"
import { logger } from "./logger"
import crypto from "crypto"

export async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return token
}

export async function verifyEmailToken(token: string): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return { success: false, error: "Invalid verification token" }
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      })
      return { success: false, error: "Verification token has expired" }
    }

    const user = await prisma.user.findFirst({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })

    return { success: true, email: user.email }
  } catch (error) {
    logger.error("Email verification error", {}, error as Error)
    return { success: false, error: "Verification failed" }
  }
}

export async function generatePasswordResetToken(email: string): Promise<string | null> {
  try {
    const user = await prisma.user.findFirst({
      where: { email },
    })

    if (!user) {
      return null
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    })

    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token,
        expires,
      },
    })

    return token
  } catch (error) {
    logger.error("Password reset token generation error", { email }, error as Error)
    return null
  }
}

export async function verifyPasswordResetToken(token: string): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken || !verificationToken.identifier.startsWith("reset:")) {
      return { success: false, error: "Invalid reset token" }
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      })
      return { success: false, error: "Reset token has expired" }
    }

    const email = verificationToken.identifier.replace("reset:", "")

    await prisma.verificationToken.delete({
      where: { token },
    })

    return { success: true, email }
  } catch (error) {
    logger.error("Password reset token verification error", {}, error as Error)
    return { success: false, error: "Verification failed" }
  }
}
