export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getUserGameHistory } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")
    const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 10

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const gameHistory = await getUserGameHistory(address, page, limit)

    return NextResponse.json({
      success: true,
      data: gameHistory.bets,
      pagination: {
        totalPages: gameHistory.totalPages,
        currentPage: gameHistory.currentPage,
        totalBets: gameHistory.totalBets,
      },
    })
  } catch (error) {
    console.error("Error fetching game history:", error)
    return NextResponse.json({ error: "Failed to fetch game history" }, { status: 500 })
  }
}

