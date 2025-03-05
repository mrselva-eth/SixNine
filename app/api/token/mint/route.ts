import { type NextRequest, NextResponse } from "next/server"
import { updateTokenMinting } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const { address, eth, tokens, txHash } = await request.json()

    if (!address || !eth || !tokens || !txHash) {
      return NextResponse.json({ error: "Address, eth, tokens, and txHash are required" }, { status: 400 })
    }

    const updatedProfile = await updateTokenMinting(address, eth, tokens, txHash)

    return NextResponse.json({ success: true, data: updatedProfile })
  } catch (error) {
    console.error("Error recording mint transaction:", error)
    return NextResponse.json({ error: "Failed to record mint transaction" }, { status: 500 })
  }
}

