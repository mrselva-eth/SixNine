export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getUserBalance } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const balance = await getUserBalance(address)

    return NextResponse.json({ success: true, data: { balance } })
  } catch (error) {
    console.error("Error fetching balance:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}

