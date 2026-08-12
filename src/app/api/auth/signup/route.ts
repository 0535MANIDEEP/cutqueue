import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { templates } from "@/lib/templates"
import { generateVerificationToken } from "@/lib/auth-tokens"
import { sendPlatformEmail } from "@/lib/notify"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, shopName, templateSlug } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role: shopName ? "BUSINESS_OWNER" : "CUSTOMER",
      },
    })

    if (shopName) {
      const slug = shopName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const template = await prisma.industryTemplate.findUnique({
        where: { slug: templateSlug || "barbershop" },
      })

      if (!template) {
        return NextResponse.json(
          { error: "Industry template not found" },
          { status: 400 }
        )
      }

      const business = await prisma.business.create({
        data: {
          ownerId: user.id,
          templateId: template.id,
          name: shopName,
          slug: `${slug}-${user.id.slice(0, 6)}`,
          phone: phone || "",
          email,
          address: "",
          city: "",
          openingHours: {},
          settings: {},
        },
      })

      await prisma.queue.create({
        data: {
          businessId: business.id,
          queueType: template.queueType as string,
        },
      })

      const templateData = templates.find((t) => t.slug === (templateSlug || "barbershop"))
      if (templateData?.defaultServices) {
        await prisma.service.createMany({
          data: templateData.defaultServices.map((s) => ({
            businessId: business.id,
            name: s.name,
            description: s.name,
            duration: s.duration,
            price: s.price,
            category: s.category,
          })),
        })
      }
    }

    // Send verification email
    const token = await generateVerificationToken(email)
    const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
    await sendPlatformEmail(
      email,
      "Verify your QueueForge account",
      `<h2>Verify your email</h2><p>Click the link below to verify your email address:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`
    )

    logger.info("Verification email sent on signup", { email, userId: user.id })

    return NextResponse.json(
      { message: "Account created successfully. Please verify your email.", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    logger.error("Signup error", {}, error as Error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
