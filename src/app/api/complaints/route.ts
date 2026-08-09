import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const validCategories = ["SERVICE_QUALITY", "WAIT_TIME", "STAFF_BEHAVIOR", "PRICING", "CLEANLINESS", "OTHER"]
const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "DISMISSED"]
const validPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"]

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")

    const where: Record<string, unknown> = {}

    if (session.user.role === "ADMIN") {
      if (businessId) where.businessId = businessId
    } else if (session.user.role === "BUSINESS_OWNER") {
      const business = await prisma.business.findFirst({
        where: { ownerId: session.user.id },
      })
      if (business) where.businessId = business.id
      else return NextResponse.json([])
    } else {
      where.customerId = session.user.id
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true } },
        business: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(complaints)
  } catch (error) {
    console.error("Complaints GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { businessId, bookingId, category, subject, description } = await req.json()

    if (!businessId || !category || !subject || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } })
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const complaint = await prisma.complaint.create({
      data: {
        customerId: session.user.id,
        businessId,
        bookingId,
        category: category as "SERVICE_QUALITY" | "WAIT_TIME" | "STAFF_BEHAVIOR" | "PRICING" | "CLEANLINESS" | "OTHER",
        subject,
        description,
        status: "OPEN",
        priority: "NORMAL",
      },
    })

    return NextResponse.json(complaint, { status: 201 })
  } catch (error) {
    console.error("Complaints POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { complaintId, status, response, priority } = await req.json()

    if (!complaintId) {
      return NextResponse.json({ error: "complaintId required" }, { status: 400 })
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    })

    if (!complaint) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "BUSINESS_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (session.user.role === "BUSINESS_OWNER") {
      const business = await prisma.business.findFirst({
        where: { ownerId: session.user.id },
      })
      if (business?.id !== complaint.businessId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updateData.status = status
    }
    if (response) {
      updateData.response = response
      updateData.respondedAt = new Date()
    }
    if (priority) {
      if (!validPriorities.includes(priority)) {
        return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
      }
      updateData.priority = priority
    }
    if (status === "RESOLVED") updateData.resolvedAt = new Date()

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Complaints PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
