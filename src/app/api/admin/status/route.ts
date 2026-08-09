import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllServiceChecks } from "@/lib/guardrails"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const services = getAllServiceChecks()

    return NextResponse.json({
      services,
      allConfigured: services.every((s) => s.status === "configured"),
      requiredMissing: services.filter((s) => s.required && s.status !== "configured"),
    })
  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
