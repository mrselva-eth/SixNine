export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const metric =
      (searchParams.get("metric") as "balance" | "totalBets" | "totalWins" | "winRate" | "highestWin") || "balance"
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 10

    const leaderboard = await getLeaderboard(metric, limit)

    return NextResponse.json({ success: true, data: leaderboard })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

