import { type NextRequest, NextResponse } from "next/server"
import { updateUserDeposit } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const { address, amount, txHash } = await request.json()

    if (!address || !amount || !txHash) {
      return NextResponse.json({ error: "Address, amount, and txHash are required" }, { status: 400 })
    }

    const updatedProfile = await updateUserDeposit(address, amount, txHash)

    return NextResponse.json({ success: true, data: updatedProfile })
  } catch (error) {
    console.error("Error updating deposit:", error)
    return NextResponse.json({ error: "Failed to update deposit" }, { status: 500 })
  }
}

