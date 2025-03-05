export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import crypto from "crypto"

// Generate a random server seed
function generateServerSeed() {
  return crypto.randomBytes(32).toString("hex")
}

// Hash the server seed for public sharing
function hashServerSeed(serverSeed: string) {
  return crypto.createHash("sha256").update(serverSeed).digest("hex")
}

// Store server seeds temporarily (in a real app, this would be in a database)
const serverSeeds = new Map<string, string>()

export async function GET() {
  try {
    // Generate new server seed
    const serverSeed = generateServerSeed()
    const serverSeedHash = hashServerSeed(serverSeed)

    // Store the server seed for future use
    serverSeeds.set(serverSeedHash, serverSeed)

    return NextResponse.json({
      serverSeedHash,
    })
  } catch (error) {
    console.error("Error generating new seed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

