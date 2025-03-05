"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Trophy, Loader2, ExternalLink } from "lucide-react"
import { fetchLeaderboard } from "@/utils/game-contract"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type LeaderboardEntry = {
  address: string
  balance: string
  totalBets: number
  totalWins: number
  winRate: number
  highestWin: string
}

type SortMetric = "balance" | "totalBets" | "totalWins" | "winRate" | "highestWin"

export default function LeaderboardPage() {
  const { address } = useAccount()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortMetric, setSortMetric] = useState<SortMetric>("balance")

  useEffect(() => {
    async function loadLeaderboard() {
      setIsLoading(true)
      try {
        const data = await fetchLeaderboard(sortMetric, 20)
        setLeaderboard(data)
      } catch (error) {
        console.error("Error loading leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLeaderboard()
  }, [sortMetric])

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Open Etherscan
  const openEtherscan = (addr: string) => {
    window.open(`https://sepolia.etherscan.io/address/${addr}`, "_blank")
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] p-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-[#0affff] to-[#0affff]/60 bg-clip-text text-transparent mb-4">
          Leaderboard
        </h1>
        <p className="text-gray-400 max-w-2xl text-center">
          Top players ranked by various metrics. See who's winning the most and climbing to the top!
        </p>
      </div>

      {/* Sort Controls */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <Select value={sortMetric} onValueChange={(value) => setSortMetric(value as SortMetric)}>
            <SelectTrigger className="w-[180px] bg-[#1a1f2e] border-gray-700">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f2e] border-gray-700">
              <SelectItem value="balance">Balance</SelectItem>
              <SelectItem value="totalBets">Total Bets</SelectItem>
              <SelectItem value="totalWins">Total Wins</SelectItem>
              <SelectItem value="winRate">Win Rate</SelectItem>
              <SelectItem value="highestWin">Highest Win</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0affff]" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg text-center">
          <p className="text-gray-400">No players have placed bets yet. Be the first to join the leaderboard!</p>
        </div>
      ) : (
        <div className="bg-[#1a1f2e] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Rank</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Player</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Balance</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Total Bets</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Wins</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Win Rate</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Highest Win</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => (
                  <tr
                    key={player.address}
                    className={`border-b border-gray-800 hover:bg-[#1f2937] ${
                      player.address.toLowerCase() === address?.toLowerCase() ? "bg-[#0affff]/10" : ""
                    }`}
                  >
                    <td className="py-4 px-6">
                      {index === 0 ? (
                        <Trophy className="h-6 w-6 text-yellow-400" />
                      ) : index === 1 ? (
                        <Trophy className="h-6 w-6 text-gray-400" />
                      ) : index === 2 ? (
                        <Trophy className="h-6 w-6 text-amber-700" />
                      ) : (
                        <span className="text-gray-400">{index + 1}</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={player.address.toLowerCase() === address?.toLowerCase() ? "text-[#0affff]" : ""}
                        >
                          {formatAddress(player.address)}
                        </span>
                        <button
                          onClick={() => openEtherscan(player.address)}
                          className="text-gray-400 hover:text-[#0affff]"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        {player.address.toLowerCase() === address?.toLowerCase() && (
                          <span className="text-xs bg-[#0affff]/20 text-[#0affff] px-2 py-0.5 rounded">You</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono">{player.balance} 69USDC</td>
                    <td className="py-4 px-6">{player.totalBets}</td>
                    <td className="py-4 px-6">{player.totalWins}</td>
                    <td className="py-4 px-6">{player.winRate.toFixed(1)}%</td>
                    <td className="py-4 px-6 font-mono">{player.highestWin} 69USDC</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

