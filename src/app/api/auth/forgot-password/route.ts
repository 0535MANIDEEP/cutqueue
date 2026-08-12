import { NextResponse } from "next/server"
import { generatePasswordResetToken } from "@/lib/auth-tokens"
import { sendPlatformEmail } from "@/lib/notify"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const token = await generatePasswordResetToken(email)

    if (token) {
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
      await sendPlatformEmail(
        email,
        "Reset your QueueForge password",
        `<h2>Password Reset</h2><p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p><p>If you didn't request this, please ignore this email.</p>`
      )
      logger.info("Password reset email sent", { email })
    }

    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent.",
    })
  } catch (error) {
    logger.error("Forgot password request error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
