export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { updateTokenExchange } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const { address, tokens, eth, txHash } = await request.json()

    if (!address || !tokens || !eth || !txHash) {
      return NextResponse.json({ error: "Address, tokens, eth, and txHash are required" }, { status: 400 })
    }

    const updatedProfile = await updateTokenExchange(address, tokens, eth, txHash)

    return NextResponse.json({ success: true, data: updatedProfile })
  } catch (error) {
    console.error("Error recording exchange transaction:", error)
    return NextResponse.json({ error: "Failed to record exchange transaction" }, { status: 500 })
  }
}

