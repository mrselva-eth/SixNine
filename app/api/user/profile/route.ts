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

    return NextResponse.json({ success: true, data: userProfile })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

