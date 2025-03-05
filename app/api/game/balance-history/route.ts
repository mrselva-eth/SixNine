export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getBalanceHistory } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")
    const hours = searchParams.get("hours") ? Number.parseInt(searchParams.get("hours")!) : 24

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const history = await getBalanceHistory(address, hours)

    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    console.error("Error fetching balance history:", error)
    return NextResponse.json({ error: "Failed to fetch balance history" }, { status: 500 })
  }
}

