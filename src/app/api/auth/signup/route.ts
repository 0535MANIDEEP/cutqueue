import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { templates, getTemplate } from "@/lib/templates"
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

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
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
    const slug = templateSlug || "barbershop"
    const templateData = getTemplate(slug)

    if (shopName && !templateData) {
      return NextResponse.json(
        { error: "Invalid industry template" },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          phone: phone || null,
          role: shopName ? "BUSINESS_OWNER" : "CUSTOMER",
        },
      })

      if (shopName && templateData) {
        let industryTemplate = await tx.industryTemplate.findUnique({
          where: { slug },
        })

        if (!industryTemplate) {
          industryTemplate = await tx.industryTemplate.create({
            data: {
              slug: templateData.slug,
              name: templateData.name,
              description: templateData.description,
              category: templateData.category,
              icon: templateData.icon,
              queueType: templateData.queueType,
              features: templateData.features,
              defaultServices: templateData.defaultServices,
            },
          })
        }

        const businessSlug = shopName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")

        const business = await tx.business.create({
          data: {
            ownerId: user.id,
            templateId: industryTemplate.id,
            name: shopName,
            slug: `${businessSlug}-${user.id.slice(0, 6)}`,
            phone: phone || "",
            email,
            address: "",
            city: "",
            openingHours: {},
            settings: {},
          },
        })

        await tx.queue.create({
          data: {
            businessId: business.id,
            queueType: templateData.queueType,
          },
        })

        if (templateData.defaultServices?.length) {
          await tx.service.createMany({
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

        return { user, business }
      }

      return { user, business: null }
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
    try {
      const token = await generateVerificationToken(email)
      const verifyUrl = `${appUrl}/auth/verify?token=${token}`
      await sendPlatformEmail(
        email,
        "Verify your QueueForge account",
        `<h2>Verify your email</h2><p>Click the link below to verify your email address:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`
      )
    } catch (emailError) {
      logger.warn("Failed to send verification email (non-blocking)", { email, error: String(emailError) })
    }

    logger.info("Account created", { email, userId: result.user.id, isOwner: !!shopName })

    return NextResponse.json(
      { message: "Account created successfully", userId: result.user.id },
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
