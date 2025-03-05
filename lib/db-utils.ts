import clientPromise from "./mongodb"
import type { ObjectId } from "mongodb"

// User profile type
export type UserProfile = {
  _id?: ObjectId
  address: string
  depositedAmount: string
  deposits: Array<{
    amount: string
    txHash: string
    timestamp: Date
  }>
  withdrawAmount: string
  withdrawals: Array<{
    amount: string
    txHash: string
    timestamp: Date
  }>
  availableBalance: string
  totalMinted: Array<{
    eth: string
    tokens: string
    txHash: string
    timestamp: Date
  }>
  totalExchanged: Array<{
    tokens: string
    eth: string
    txHash: string
    timestamp: Date
  }>
  bets: Array<{
    amount: string
    roll: number
    outcome: "win" | "lose"
    profit: string
    serverSeed: string
    serverSeedRevealed: string
    clientSeed: string
    nonce: number
    betType?: "classic" | "specific" | "odd-even" | "range" // Added betType
    betOption?: string // Added betOption (specific number, odd/even choice, or range choice)
    multiplier?: number // Added multiplier
    timestamp: Date
  }>
  createdAt: Date
  updatedAt: Date
}

// Balance history type
export type BalanceHistoryPoint = {
  balance: string
  timestamp: Date
}

// Get or create user profile
export async function getUserProfile(address: string): Promise<UserProfile> {
  const client = await clientPromise
  const db = client.db("dice-game")

  // Convert address to lowercase for consistency
  address = address.toLowerCase()

  // Try to find existing user
  const existingUser = await db.collection("users").findOne({ address })

  if (existingUser) {
    return existingUser as UserProfile
  }

  // Create new user profile if not found
  const newUser: UserProfile = {
    address,
    depositedAmount: "0",
    deposits: [],
    withdrawAmount: "0",
    withdrawals: [],
    availableBalance: "0",
    totalMinted: [],
    totalExchanged: [],
    bets: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await db.collection("users").insertOne(newUser)
  return newUser
}

// Update user deposit
export async function updateUserDeposit(address: string, amount: string, txHash: string): Promise<UserProfile> {
  const client = await clientPromise
  const db = client.db("dice-game")
  address = address.toLowerCase()

  // Get current user profile
  const user = await getUserProfile(address)

  // Calculate new deposited amount and available balance
  const newDepositedAmount = (BigInt(user.depositedAmount) + BigInt(amount)).toString()
  const newAvailableBalance = (BigInt(user.availableBalance) + BigInt(amount)).toString()

  // Update user profile
  const updatedUser = await db.collection("users").findOneAndUpdate(
    { address },
    {
      $set: {
        depositedAmount: newDepositedAmount,
        availableBalance: newAvailableBalance,
        updatedAt: new Date(),
      },
      $push: {
        deposits: {
          amount,
          txHash,
          timestamp: new Date(),
        },
      },
    },
    { returnDocument: "after" },
  )

  if (!updatedUser.value) {
    throw new Error(`Failed to update user deposit for address: ${address}`)
  }

  return updatedUser.value as UserProfile
}

// Update user withdrawal
export async function updateUserWithdrawal(address: string, amount: string, txHash: string): Promise<UserProfile> {
  const client = await clientPromise
  const db = client.db("dice-game")
  address = address.toLowerCase()

  // Get current user profile
  const user = await getUserProfile(address)

  // Ensure user has enough balance
  if (BigInt(user.availableBalance) < BigInt(amount)) {
    throw new Error("Insufficient balance")
  }

  // Calculate new withdrawn amount and available balance
  const newWithdrawAmount = (BigInt(user.withdrawAmount) + BigInt(amount)).toString()
  const newAvailableBalance = (BigInt(user.availableBalance) - BigInt(amount)).toString()

  // Update user profile
  const updatedUser = await db.collection("users").findOneAndUpdate(
    { address },
    {
      $set: {
        withdrawAmount: newWithdrawAmount,
        availableBalance: newAvailableBalance,
        updatedAt: new Date(),
      },
      $push: {
        withdrawals: {
          amount,
          txHash,
          timestamp: new Date(),
        },
      },
    },
    { returnDocument: "after" },
  )

  if (!updatedUser.value) {
    throw new Error(`Failed to update user withdrawal for address: ${address}`)
  }

  return updatedUser.value as UserProfile
}

// Get balance history for the last N hours
export async function getBalanceHistory(address: string, hours = 24): Promise<BalanceHistoryPoint[]> {
  const client = await clientPromise
  const db = client.db("dice-game")
  address = address.toLowerCase()

  // Get user profile
  const user = await getUserProfile(address)

  // If no bets, deposits or withdrawals, return current balance only
  if (user.bets.length === 0 && user.deposits.length === 0 && user.withdrawals.length === 0) {
    return [
      {
        balance: user.availableBalance,
        timestamp: new Date(),
      },
    ]
  }

  // Calculate the cutoff time (N hours ago)
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - hours)

  // Collect all balance-changing events
  const events: Array<{
    amount: string
    isPositive: boolean
    timestamp: Date
  }> = []

  // Add deposits
  user.deposits.forEach((deposit) => {
    if (deposit.timestamp >= cutoffTime) {
      events.push({
        amount: deposit.amount,
        isPositive: true,
        timestamp: deposit.timestamp,
      })
    }
  })

  // Add withdrawals
  user.withdrawals.forEach((withdrawal) => {
    if (withdrawal.timestamp >= cutoffTime) {
      events.push({
        amount: withdrawal.amount,
        isPositive: false,
        timestamp: withdrawal.timestamp,
      })
    }
  })

  // Add bets
  user.bets.forEach((bet) => {
    if (bet.timestamp >= cutoffTime) {
      const amount = bet.amount
      const isPositive = bet.outcome === "win"

      events.push({
        amount: isPositive ? amount : `-${amount}`,
        isPositive,
        timestamp: bet.timestamp,
      })
    }
  })

  // Sort events by timestamp (oldest first)
  events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  // Calculate balance at each point
  const history: BalanceHistoryPoint[] = []

  // Start with current balance and work backwards
  let currentBalance = BigInt(user.availableBalance)

  // Add current balance as the latest point
  history.push({
    balance: currentBalance.toString(),
    timestamp: new Date(),
  })

  // Work backwards through events to reconstruct balance history
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i]

    // Reverse the effect of this event on the balance
    if (event.isPositive) {
      // If it was a positive event, subtract the amount
      currentBalance -= BigInt(event.amount)
    } else {
      // If it was a negative event, add the amount (removing the negative sign)
      currentBalance += BigInt(event.amount.replace("-", ""))
    }

    // Add this point to history
    history.unshift({
      balance: currentBalance.toString(),
      timestamp: event.timestamp,
    })
  }

  // If we have fewer than 2 points, add a starting point
  if (history.length < 2) {
    history.unshift({
      balance: history[0].balance,
      timestamp: cutoffTime,
    })
  }

  return history
}

// Update the updateUserBet function to track balance history
export async function updateUserBet(
  address: string,
  betAmount: string,
  roll: number,
  outcome: "win" | "lose",
  serverSeed: string,
  serverSeedRevealed: string,
  clientSeed: string,
  nonce: number,
  betType?: "classic" | "specific" | "odd-even" | "range", // Added betType
  betOption?: string, // Added betOption
  multiplier?: number, // Added multiplier
): Promise<UserProfile> {
  try {
    const client = await clientPromise
    const db = client.db("dice-game")
    address = address.toLowerCase()

    // Get current user profile
    const user = await getUserProfile(address)

    if (!user) {
      throw new Error(`User profile not found for address: ${address}`)
    }

    // Ensure user has enough balance
    if (BigInt(user.availableBalance) < BigInt(betAmount)) {
      throw new Error(`Insufficient balance: ${user.availableBalance} < ${betAmount}`)
    }

    // Calculate profit/loss and new available balance
    let profit = "0"
    let newAvailableBalance = user.availableBalance

    if (outcome === "win") {
      // Player wins based on multiplier (or default 2x if not provided)
      const actualMultiplier = multiplier || 2
      const winAmount = (BigInt(betAmount) * BigInt(actualMultiplier - 1)).toString()
      profit = winAmount
      newAvailableBalance = (BigInt(user.availableBalance) + BigInt(winAmount)).toString()
    } else {
      // Player loses their bet
      profit = `-${betAmount}`
      newAvailableBalance = (BigInt(user.availableBalance) - BigInt(betAmount)).toString()
    }

    // Create the bet record
    const betRecord = {
      amount: betAmount,
      roll,
      outcome,
      profit,
      serverSeed,
      serverSeedRevealed,
      clientSeed,
      nonce,
      betType, // Include the bet type
      betOption, // Include the bet option
      multiplier, // Include the multiplier
      timestamp: new Date(),
    }

    // Update in two steps
    // First, update the balance
    await db.collection("users").updateOne(
      { address },
      {
        $set: {
          availableBalance: newAvailableBalance,
          updatedAt: new Date(),
        },
      },
    )

    // Then, push the bet record
    await db.collection("users").updateOne(
      { address },
      {
        $push: {
          bets: betRecord,
        },
      },
    )

    // Get the updated user profile
    const updatedUser = await db.collection("users").findOne({ address })

    if (!updatedUser) {
      throw new Error(`Failed to retrieve updated user profile for address: ${address}`)
    }

    return updatedUser as UserProfile
  } catch (error) {
    console.error("Error in updateUserBet:", error)
    throw error
  }
}

// Get user game history with pagination
export async function getUserGameHistory(
  address: string,
  page = 1,
  limit = 10,
): Promise<{
  bets: UserProfile["bets"]
  totalPages: number
  currentPage: number
  totalBets: number
}> {
  const client = await clientPromise
  const db = client.db("dice-game")
  address = address.toLowerCase()

  // Get user profile
  const user = await getUserProfile(address)

  // Sort bets by timestamp (most recent first)
  const sortedBets = user.bets.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  // Calculate pagination
  const totalBets = sortedBets.length
  const totalPages = Math.ceil(totalBets / limit)
  const currentPage = Math.min(Math.max(1, page), totalPages || 1)
  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit

  // Get bets for the current page
  const paginatedBets = sortedBets.slice(startIndex, endIndex)

  return {
    bets: paginatedBets,
    totalPages,
    currentPage,
    totalBets,
  }
}

// Update token minting
export async function updateTokenMinting(
  address: string,
  eth: string,
  tokens: string,
  txHash: string,
): Promise<UserProfile> {
  const client = await clientPromise
  const db = client.db("dice-game")
  address = address.toLowerCase()

  // Get current user profile
  const user = await getUserProfile(address)

  // Update user profile
  const updatedUser = await db.collection("users").findOneAndUpdate(
    { address },
    {
      $set: {
        updatedAt: new Date(),
      },
      $push: {
        totalMinted: {
          eth,
          tokens,
          txHash,
          timestamp: new Date(),
        },
      },
    },
    { returnDocument: "after" },
  )

  if (!updatedUser.value) {
    throw new Error(`Failed to update token minting for address: ${address}`)
  }

  return updatedUser.value as UserProfile
}

// Update token exchange
export async function updateTokenExchange(
  address: string,
  tokens: string,
  eth: string,
  txHash: string,
): Promise<UserProfile> {
  const client = await clientPromise
  const db = client.db("dice-game")
  address = address.toLowerCase()

  // Get current user profile
  const user = await getUserProfile(address)

  // Update user profile
  const updatedUser = await db.collection("users").findOneAndUpdate(
    { address },
    {
      $set: {
        updatedAt: new Date(),
      },
      $push: {
        totalExchanged: {
          tokens,
          eth,
          txHash,
          timestamp: new Date(),
        },
      },
    },
    { returnDocument: "after" },
  )

  if (!updatedUser.value) {
    throw new Error(`Failed to update token exchange for address: ${address}`)
  }

  return updatedUser.value as UserProfile
}

// Get user balance
export async function getUserBalance(address: string): Promise<string> {
  try {
    const user = await getUserProfile(address)
    return user.availableBalance
  } catch (error) {
    console.error(`Error getting balance for ${address}:`, error)
    return "0"
  }
}

// Add these new functions after the existing functions

// Get user betting statistics
export async function getUserBettingStats(
  address: string,
  hours = 24,
): Promise<{
  totalBets: number
  totalBetAmount: string
  totalWins: number
  totalWinAmount: string
  totalLosses: number
  totalLossAmount: string
  previousStats?: {
    totalBets: number
    totalBetAmount: string
    totalWins: number
    totalWinAmount: string
    totalLosses: number
    totalLossAmount: string
  }
}> {
  const client = await clientPromise
  const db = client.db("dice-game")
  address = address.toLowerCase()

  // Get user profile
  const user = await getUserProfile(address)

  // Calculate the cutoff time (N hours ago)
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - hours)

  // Previous period cutoff (for calculating percentage change)
  const previousCutoffTime = new Date(cutoffTime)
  previousCutoffTime.setHours(previousCutoffTime.getHours() - hours)

  // Filter bets for current period
  const currentBets = user.bets.filter((bet) => bet.timestamp >= cutoffTime)

  // Filter bets for previous period (for percentage calculations)
  const previousBets = user.bets.filter((bet) => bet.timestamp >= previousCutoffTime && bet.timestamp < cutoffTime)

  // Calculate current period stats
  const totalBets = currentBets.length
  const totalBetAmount = currentBets.reduce((sum, bet) => sum + BigInt(bet.amount), BigInt(0)).toString()

  const wins = currentBets.filter((bet) => bet.outcome === "win")
  const totalWins = wins.length
  const totalWinAmount = wins
    .reduce(
      (sum, bet) => sum + BigInt(bet.amount), // This is profit since win is 2x bet
      BigInt(0),
    )
    .toString()

  const losses = currentBets.filter((bet) => bet.outcome === "lose")
  const totalLosses = losses.length
  const totalLossAmount = losses.reduce((sum, bet) => sum + BigInt(bet.amount), BigInt(0)).toString()

  // Calculate previous period stats if needed
  let previousStats
  if (previousBets.length > 0) {
    const prevWins = previousBets.filter((bet) => bet.outcome === "win")
    const prevLosses = previousBets.filter((bet) => bet.outcome === "lose")

    previousStats = {
      totalBets: previousBets.length,
      totalBetAmount: previousBets.reduce((sum, bet) => sum + BigInt(bet.amount), BigInt(0)).toString(),
      totalWins: prevWins.length,
      totalWinAmount: prevWins.reduce((sum, bet) => sum + BigInt(bet.amount), BigInt(0)).toString(),
      totalLosses: prevLosses.length,
      totalLossAmount: prevLosses.reduce((sum, bet) => sum + BigInt(bet.amount), BigInt(0)).toString(),
    }
  }

  return {
    totalBets,
    totalBetAmount,
    totalWins,
    totalWinAmount,
    totalLosses,
    totalLossAmount,
    previousStats,
  }
}

// Get historical betting statistics for charts
export async function getBettingStatsHistory(
  address: string,
  hours = 24,
): Promise<{
  betCountHistory: Array<{ count: number; timestamp: Date }>
  betAmountHistory: Array<{ amount: string; timestamp: Date }>
  winCountHistory: Array<{ count: number; timestamp: Date }>
  winAmountHistory: Array<{ amount: string; timestamp: Date }>
  lossCountHistory: Array<{ count: number; timestamp: Date }>
  lossAmountHistory: Array<{ amount: string; timestamp: Date }>
}> {
  const client = await clientPromise
  const db = client.db("dice-game")
  address = address.toLowerCase()

  // Get user profile
  const user = await getUserProfile(address)

  // Calculate the cutoff time
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - hours)

  // Filter bets for the period
  const filteredBets = user.bets.filter((bet) => bet.timestamp >= cutoffTime)

  // Group bets by hour
  const hourlyData: Record<
    string,
    {
      timestamp: Date
      betCount: number
      betAmount: bigint
      winCount: number
      winAmount: bigint
      lossCount: number
      lossAmount: bigint
    }
  > = {}

  // Initialize with empty data for each hour
  for (let i = 0; i <= hours; i++) {
    const hourTime = new Date(cutoffTime)
    hourTime.setHours(hourTime.getHours() + i)
    const hourKey = hourTime.toISOString().substring(0, 13) // YYYY-MM-DDTHH format

    hourlyData[hourKey] = {
      timestamp: new Date(hourTime),
      betCount: 0,
      betAmount: BigInt(0),
      winCount: 0,
      winAmount: BigInt(0),
      lossCount: 0,
      lossAmount: BigInt(0),
    }
  }

  // Populate with actual data
  filteredBets.forEach((bet) => {
    const hourKey = bet.timestamp.toISOString().substring(0, 13)

    if (hourlyData[hourKey]) {
      hourlyData[hourKey].betCount += 1
      hourlyData[hourKey].betAmount += BigInt(bet.amount)

      if (bet.outcome === "win") {
        hourlyData[hourKey].winCount += 1
        hourlyData[hourKey].winAmount += BigInt(bet.amount)
      } else {
        hourlyData[hourKey].lossCount += 1
        hourlyData[hourKey].lossAmount += BigInt(bet.amount)
      }
    }
  })

  // Convert to arrays for charts
  const hourlyEntries = Object.values(hourlyData).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  return {
    betCountHistory: hourlyEntries.map((entry) => ({
      count: entry.betCount,
      timestamp: entry.timestamp,
    })),
    betAmountHistory: hourlyEntries.map((entry) => ({
      amount: entry.betAmount.toString(),
      timestamp: entry.timestamp,
    })),
    winCountHistory: hourlyEntries.map((entry) => ({
      count: entry.winCount,
      timestamp: entry.timestamp,
    })),
    winAmountHistory: hourlyEntries.map((entry) => ({
      amount: entry.winAmount.toString(),
      timestamp: entry.timestamp,
    })),
    lossCountHistory: hourlyEntries.map((entry) => ({
      count: entry.lossCount,
      timestamp: entry.timestamp,
    })),
    lossAmountHistory: hourlyEntries.map((entry) => ({
      amount: entry.lossAmount.toString(),
      timestamp: entry.timestamp,
    })),
  }
}

// Add these new functions at the end of the file

// Get leaderboard data
export async function getLeaderboard(
  metric: "balance" | "totalBets" | "totalWins" | "winRate" | "highestWin",
  limit = 10,
): Promise<
  Array<{
    address: string
    balance: string
    totalBets: number
    totalWins: number
    winRate: number
    highestWin: string
  }>
> {
  const client = await clientPromise
  const db = client.db("dice-game")

  // Get all users
  const users = await db.collection("users").find({}).toArray()

  // Calculate metrics for each user
  const leaderboardData = users.map((user: any) => {
    const totalBets = user.bets?.length || 0
    const totalWins = user.bets?.filter((bet: any) => bet.outcome === "win").length || 0
    const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0

    // Find highest win
    let highestWin = "0"
    if (user.bets && user.bets.length > 0) {
      const wins = user.bets.filter((bet: any) => bet.outcome === "win")
      if (wins.length > 0) {
        highestWin = wins.reduce((max: string, bet: any) => {
          return BigInt(bet.amount) > BigInt(max) ? bet.amount : max
        }, "0")
      }
    }

    return {
      address: user.address,
      balance: user.availableBalance || "0",
      totalBets,
      totalWins,
      winRate,
      highestWin,
    }
  })

  // Sort based on the selected metric
  let sortedData
  switch (metric) {
    case "balance":
      sortedData = leaderboardData.sort((a, b) => BigInt(b.balance) - BigInt(a.balance))
      break
    case "totalBets":
      sortedData = leaderboardData.sort((a, b) => b.totalBets - a.totalBets)
      break
    case "totalWins":
      sortedData = leaderboardData.sort((a, b) => b.totalWins - a.totalWins)
      break
    case "winRate":
      sortedData = leaderboardData.sort((a, b) => b.winRate - a.winRate)
      break
    case "highestWin":
      sortedData = leaderboardData.sort((a, b) => BigInt(b.highestWin) - BigInt(a.highestWin))
      break
    default:
      sortedData = leaderboardData.sort((a, b) => BigInt(b.balance) - BigInt(a.balance))
  }

  // Return only users who have placed at least one bet
  return sortedData.filter((user) => user.totalBets > 0).slice(0, limit)
}

