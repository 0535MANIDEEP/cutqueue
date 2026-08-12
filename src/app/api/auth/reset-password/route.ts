import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { verifyPasswordResetToken } from "@/lib/auth-tokens"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const verification = await verifyPasswordResetToken(token)

    if (!verification.success || !verification.email) {
      return NextResponse.json(
        { error: verification.error || "Invalid token" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { email: verification.email },
      data: { passwordHash },
    })

    return NextResponse.json({ message: "Password reset successful" })
  } catch (error) {
    logger.error("Password reset error", {}, error as Error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
