export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getUserBettingStats } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")
    const hours = searchParams.get("hours") ? Number.parseInt(searchParams.get("hours")!) : 24

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const stats = await getUserBettingStats(address, hours)

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error("Error fetching betting stats:", error)
    return NextResponse.json({ error: "Failed to fetch betting stats" }, { status: 500 })
  }
}

