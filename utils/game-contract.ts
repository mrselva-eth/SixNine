import { parseEther } from "viem"
import { useWriteContract } from "wagmi"

// Update the contract address with the deployed address
export const DICE_GAME_CONTRACT_ADDRESS = "0x5d69e1E14defd69FD617a3F07d739Cae099F4209"

// ABI for the DiceGame contract
export const DICE_GAME_ABI = [
  // Read functions
  {
    inputs: [],
    name: "token",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdrawEth",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawAllEth",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdrawTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawAllTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

// Game history type
export type GameHistoryItem = {
  amount: string
  roll: number
  outcome: "win" | "lose"
  profit: string
  serverSeed: string
  serverSeedRevealed: string
  clientSeed: string
  nonce: number
  betType?: "classic" | "specific" | "odd-even" | "range"
  betOption?: string
  multiplier?: number
  timestamp: Date
}

// Pagination type
export type PaginationInfo = {
  totalPages: number
  currentPage: number
  totalBets: number
}

// Hook for writing to game contract
export function useGameContractWrite() {
  return useWriteContract()
}

// Helper function to deposit tokens to the game
export function depositToGame(writeContract: ReturnType<typeof useGameContractWrite>["writeContract"], amount: string) {
  if (!writeContract) return

  return writeContract({
    abi: DICE_GAME_ABI,
    address: DICE_GAME_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "deposit",
    args: [parseEther(amount)],
    gas: BigInt(100000), // Set a reasonable gas limit
  })
}

// Helper function to withdraw tokens from the game
export function withdrawFromGame(
  writeContract: ReturnType<typeof useGameContractWrite>["writeContract"],
  amount: string,
) {
  if (!writeContract) return

  return writeContract({
    abi: DICE_GAME_ABI,
    address: DICE_GAME_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "withdraw",
    args: [parseEther(amount)],
    gas: BigInt(100000), // Set a reasonable gas limit
  })
}

// Ensure the fetchGameBalance function is properly implemented to get the latest balance
// Make sure this function is exported and used in the SiteHeader component

export async function fetchGameBalance(address: string): Promise<string> {
  try {
    const response = await fetch(`/api/game/balance?address=${address}`)
    const data = await response.json()

    if (data.success) {
      return data.data.balance
    }

    return "0"
  } catch (error) {
    console.error("Error fetching game balance:", error)
    return "0"
  }
}

// Fetch user game history from MongoDB with pagination
export async function fetchGameHistory(
  address: string,
  page = 1,
  limit = 10,
): Promise<{
  history: GameHistoryItem[]
  pagination: PaginationInfo
}> {
  try {
    const response = await fetch(`/api/game/history?address=${address}&page=${page}&limit=${limit}`)
    const data = await response.json()

    if (data.success) {
      // Convert timestamp strings to Date objects
      const history = data.data.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }))

      return {
        history,
        pagination: data.pagination,
      }
    }

    return {
      history: [],
      pagination: {
        totalPages: 0,
        currentPage: 1,
        totalBets: 0,
      },
    }
  } catch (error) {
    console.error("Error fetching game history:", error)
    return {
      history: [],
      pagination: {
        totalPages: 0,
        currentPage: 1,
        totalBets: 0,
      },
    }
  }
}

// Update deposit in MongoDB
export async function updateDeposit(address: string, amount: string, txHash: string): Promise<boolean> {
  try {
    const response = await fetch("/api/game/deposit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address, amount, txHash }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error updating deposit:", error)
    return false
  }
}

// Update withdrawal in MongoDB
export async function updateWithdrawal(address: string, amount: string, txHash: string): Promise<boolean> {
  try {
    const response = await fetch("/api/game/withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address, amount, txHash }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error updating withdrawal:", error)
    return false
  }
}

// Place a bet and update in MongoDB
export async function placeBet(
  address: string,
  betAmount: number,
  clientSeed: string,
  nonce: number,
  serverSeedHash?: string,
  betType?: "classic" | "specific" | "odd-even" | "range",
  betOption?: string,
  multiplier?: number,
): Promise<any> {
  try {
    const response = await fetch("/api/game/bet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        bet: betAmount,
        clientSeed,
        nonce,
        serverSeedHash,
        betType, // Include the bet type
        betOption, // Include the bet option
        multiplier, // Include the multiplier
      }),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to place bet")
    }

    return data.success ? data.data : null
  } catch (error) {
    console.error("Error placing bet:", error)
    throw error // Re-throw to handle in the component
  }
}

// Fetch user balance history from MongoDB
export async function fetchBalanceHistory(
  address: string,
  hours = 24,
): Promise<{
  history: Array<{ balance: string; timestamp: Date }>
  change: { amount: string; percentage: string; isPositive: boolean }
}> {
  try {
    const response = await fetch(`/api/game/balance-history?address=${address}&hours=${hours}`)
    const data = await response.json()

    if (data.success) {
      // Convert timestamp strings to Date objects
      const history = data.data.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }))

      // Calculate 24h change
      let change = {
        amount: "0",
        percentage: "0",
        isPositive: true,
      }

      if (history.length >= 2) {
        const oldestBalance = BigInt(history[0].balance)
        const latestBalance = BigInt(history[history.length - 1].balance)

        if (oldestBalance > 0) {
          const changeAmount = latestBalance - oldestBalance
          const changePercentage = Number((changeAmount * BigInt(10000)) / oldestBalance) / 100

          change = {
            amount: changeAmount.toString(),
            percentage: changePercentage.toFixed(2),
            isPositive: changeAmount >= 0,
          }
        }
      }

      return {
        history,
        change,
      }
    }

    return {
      history: [],
      change: { amount: "0", percentage: "0", isPositive: true },
    }
  } catch (error) {
    console.error("Error fetching balance history:", error)
    return {
      history: [],
      change: { amount: "0", percentage: "0", isPositive: true },
    }
  }
}

// Fetch user betting statistics
export async function fetchBettingStats(
  address: string,
  hours = 24,
): Promise<{
  totalBets: number
  totalBetAmount: string
  totalWins: number
  totalWinAmount: string
  totalLosses: number
  totalLossAmount: string
  percentChanges?: {
    totalBets: number
    totalBetAmount: number
    totalWins: number
    totalWinAmount: number
    totalLosses: number
    totalLossAmount: number
  }
}> {
  try {
    const response = await fetch(`/api/game/betting-stats?address=${address}&hours=${hours}`)
    const data = await response.json()

    if (data.success) {
      // Calculate percentage changes if previous stats exist
      let percentChanges
      if (data.data.previousStats) {
        const prev = data.data.previousStats
        const current = data.data

        // Helper function to calculate percentage change
        const calcPercentChange = (current: string | number, previous: string | number) => {
          const curr = typeof current === "string" ? Number(current) : current
          const prev = typeof previous === "string" ? Number(previous) : previous

          if (prev === 0) return curr > 0 ? 100 : 0
          return ((curr - prev) / prev) * 100
        }

        percentChanges = {
          totalBets: calcPercentChange(current.totalBets, prev.totalBets),
          totalBetAmount: calcPercentChange(current.totalBetAmount, prev.totalBetAmount),
          totalWins: calcPercentChange(current.totalWins, prev.totalWins),
          totalWinAmount: calcPercentChange(current.totalWinAmount, prev.totalWinAmount),
          totalLosses: calcPercentChange(current.totalLosses, prev.totalLosses),
          totalLossAmount: calcPercentChange(current.totalLossAmount, prev.totalLossAmount),
        }
      }

      return {
        ...data.data,
        percentChanges,
      }
    }

    return {
      totalBets: 0,
      totalBetAmount: "0",
      totalWins: 0,
      totalWinAmount: "0",
      totalLosses: 0,
      totalLossAmount: "0",
    }
  } catch (error) {
    console.error("Error fetching betting stats:", error)
    return {
      totalBets: 0,
      totalBetAmount: "0",
      totalWins: 0,
      totalWinAmount: "0",
      totalLosses: 0,
      totalLossAmount: "0",
    }
  }
}

// Fetch betting stats history for charts
export async function fetchBettingStatsHistory(
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
  try {
    const response = await fetch(`/api/game/betting-stats-history?address=${address}&hours=${hours}`)
    const data = await response.json()

    if (data.success) {
      // Convert timestamp strings to Date objects
      const convertDates = (items: any[]) => {
        return items.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
      }

      return {
        betCountHistory: convertDates(data.data.betCountHistory),
        betAmountHistory: convertDates(data.data.betAmountHistory),
        winCountHistory: convertDates(data.data.winCountHistory),
        winAmountHistory: convertDates(data.data.winAmountHistory),
        lossCountHistory: convertDates(data.data.lossCountHistory),
        lossAmountHistory: convertDates(data.data.lossAmountHistory),
      }
    }

    return {
      betCountHistory: [],
      betAmountHistory: [],
      winCountHistory: [],
      winAmountHistory: [],
      lossCountHistory: [],
      lossAmountHistory: [],
    }
  } catch (error) {
    console.error("Error fetching betting stats history:", error)
    return {
      betCountHistory: [],
      betAmountHistory: [],
      winCountHistory: [],
      winAmountHistory: [],
      lossCountHistory: [],
      lossAmountHistory: [],
    }
  }
}

// Fetch leaderboard data
export async function fetchLeaderboard(
  metric: "balance" | "totalBets" | "totalWins" | "winRate" | "highestWin" = "balance",
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
  try {
    const response = await fetch(`/api/leaderboard?metric=${metric}&limit=${limit}`)
    const data = await response.json()

    if (data.success) {
      return data.data
    }

    return []
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

