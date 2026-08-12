import { NextResponse } from "next/server"
import { generateVerificationToken, verifyEmailToken } from "@/lib/auth-tokens"
import { sendPlatformEmail } from "@/lib/notify"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const token = await generateVerificationToken(email)

    const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
    await sendPlatformEmail(
      email,
      "Verify your QueueForge account",
      `<h2>Verify your email</h2><p>Click the link below to verify your email address:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`
    )

    logger.info("Verification email sent", { email })

    return NextResponse.json({
      message: "If an account exists with that email, a verification link has been sent.",
    })
  } catch (error) {
    logger.error("Verify email request error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const result = await verifyEmailToken(token)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    logger.error("Email verification error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
