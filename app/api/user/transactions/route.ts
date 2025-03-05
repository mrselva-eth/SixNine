export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getUserProfile } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const userProfile = await getUserProfile(address)

    // Return only the transaction data
    return NextResponse.json({
      success: true,
      data: {
        totalMinted: userProfile.totalMinted,
        totalExchanged: userProfile.totalExchanged,
      },
    })
  } catch (error) {
    console.error("Error fetching user transactions:", error)
    return NextResponse.json({ error: "Failed to fetch user transactions" }, { status: 500 })
  }
}

