import { type NextRequest, NextResponse } from "next/server"
import { getBettingStatsHistory } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")
    const hours = searchParams.get("hours") ? Number.parseInt(searchParams.get("hours")!) : 24

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const history = await getBettingStatsHistory(address, hours)

    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    console.error("Error fetching betting stats history:", error)
    return NextResponse.json({ error: "Failed to fetch betting stats history" }, { status: 500 })
  }
}

