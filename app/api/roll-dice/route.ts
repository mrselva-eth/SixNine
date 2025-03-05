export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Generate a random server seed
function generateServerSeed() {
  return crypto.randomBytes(32).toString("hex")
}

// Hash the server seed for public sharing
function hashServerSeed(serverSeed: string) {
  return crypto.createHash("sha256").update(serverSeed).digest("hex")
}

// Generate a roll result (1-6) using the server seed, client seed, and nonce
function generateRollResult(serverSeed: string, clientSeed: string, nonce: number) {
  // Combine client seed and nonce
  const message = `${clientSeed}-${nonce}`

  // Create HMAC using server seed as key and message as data
  const hmac = crypto.createHmac("sha256", serverSeed).update(message).digest("hex")

  // Take first 8 characters of HMAC and convert to decimal
  const decimal = Number.parseInt(hmac.substring(0, 8), 16)

  // Get a number between 1 and 6 (inclusive)
  return (decimal % 6) + 1
}

// Store server seeds temporarily (in a real app, this would be in a database)
const serverSeeds = new Map<string, string>()

export async function POST(request: NextRequest) {
  try {
    const { bet, clientSeed, nonce } = await request.json()

    // Validate inputs
    if (typeof bet !== "number" || bet <= 0) {
      return NextResponse.json({ message: "Invalid bet amount" }, { status: 400 })
    }

    if (!clientSeed) {
      return NextResponse.json({ message: "Client seed is required" }, { status: 400 })
    }

    if (typeof nonce !== "number") {
      return NextResponse.json({ message: "Invalid nonce" }, { status: 400 })
    }

    // Get or generate server seed
    let serverSeed: string
    let serverSeedHash = request.headers.get("X-Server-Seed-Hash")

    if (serverSeedHash && serverSeeds.has(serverSeedHash)) {
      // Use existing server seed if hash is provided and valid
      serverSeed = serverSeeds.get(serverSeedHash)!
      serverSeeds.delete(serverSeedHash) // Remove used seed
    } else {
      // Generate new server seed if no valid hash provided
      serverSeed = generateServerSeed()
      serverSeedHash = hashServerSeed(serverSeed)
    }

    // Generate a new server seed for the next roll
    const nextServerSeed = generateServerSeed()
    const nextServerSeedHash = hashServerSeed(nextServerSeed)

    // Store the new server seed for future use
    serverSeeds.set(nextServerSeedHash, nextServerSeed)

    // Generate roll result
    const roll = generateRollResult(serverSeed, clientSeed, nonce)

    // Determine outcome
    const outcome = roll >= 4 ? "win" : "lose"

    return NextResponse.json({
      roll,
      outcome,
      serverSeed,
      serverSeedHash,
      nextServerSeedHash,
    })
  } catch (error) {
    console.error("Error processing roll:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

