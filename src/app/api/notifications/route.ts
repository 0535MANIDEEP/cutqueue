import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id!, isRead: false },
  })

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { notificationId, markAllRead } = await req.json()

  if (markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id!, isRead: false },
      data: { isRead: true },
    })
    return NextResponse.json({ success: true })
  }

  if (!notificationId) {
    return NextResponse.json({ error: "notificationId required" }, { status: 400 })
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })

  return NextResponse.json({ success: true })
}
