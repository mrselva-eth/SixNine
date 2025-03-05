"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { fetchGameHistory, type GameHistoryItem, type PaginationInfo } from "@/utils/game-contract"

export default function HistoryPage() {
  const { address } = useAccount()
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalPages: 0,
    currentPage: 1,
    totalBets: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch game history from MongoDB with pagination
  const loadGameHistory = useCallback(
    async (page = 1) => {
      if (address) {
        setIsLoading(true)
        try {
          const result = await fetchGameHistory(address, page)
          setGameHistory(result.history)
          setPagination(result.pagination)
        } catch (error) {
          console.error("Error loading game history:", error)
          toast.error("Failed to load game history")
        } finally {
          setIsLoading(false)
        }
      }
    },
    [address],
  )

  // Load history when address changes
  useEffect(() => {
    if (address) {
      loadGameHistory(1) // Start with page 1
    } else {
      setGameHistory([])
      setPagination({
        totalPages: 0,
        currentPage: 1,
        totalBets: 0,
      })
    }
  }, [address, loadGameHistory])

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date)
      .toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(",", "")
  }

  // Format bet type and option for display
  const formatBetType = (game: GameHistoryItem) => {
    if (!game.betType) return "Classic (4-6)"

    switch (game.betType) {
      case "classic":
        return "Classic (4-6)"
      case "specific":
        return `Specific: ${game.betOption}`
      case "odd-even":
        return `${game.betOption === "odd" ? "Odd (1,3,5)" : "Even (2,4,6)"}`
      case "range":
        if (game.betOption === "low") return "Range: Low (1-2)"
        if (game.betOption === "mid") return "Range: Mid (3-4)"
        if (game.betOption === "high") return "Range: High (5-6)"
        return "Range"
      default:
        return "Classic (4-6)"
    }
  }

  return (
    <div className="flex-1 p-8">
      <h1 className="text-center text-5xl font-bold mb-12" style={{ fontFamily: "var(--font-orbitron)" }}>
        Game History
      </h1>

      {!address ? (
        <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg text-center">
          <p className="text-gray-400 mb-4">Connect your wallet to view your game history.</p>
        </div>
      ) : isLoading ? (
        <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg text-center">
          <p className="text-gray-400">Loading game history...</p>
        </div>
      ) : gameHistory.length === 0 ? (
        <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg text-center">
          <p className="text-gray-400">No games played yet. Roll the dice to start playing!</p>
        </div>
      ) : (
        <div className="bg-[#1a1f2e] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Roll</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Bet Type</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Bet</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Outcome</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Multiplier</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Server Seed</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {gameHistory.map((game, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-[#1f2937]">
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          game.outcome === "win" ? "bg-green-600/20 text-[#0affff]" : "bg-red-600/20 text-red-400"
                        }`}
                      >
                        {game.roll}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{formatBetType(game)}</td>
                    <td className="py-4 px-6 font-mono">{game.amount} 69USDC</td>
                    <td className="py-4 px-6">
                      <span className={game.outcome === "win" ? "text-[#0affff]" : "text-red-400"}>
                        {game.profit.startsWith("-") ? `-${game.amount}` : `+${game.profit}`} 69USDC
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-400">{game.multiplier || 2}x</td>
                    <td className="py-4 px-6">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="text-[#0affff] hover:text-[#0affff]/80 p-0 h-auto">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1f2e] border-gray-800">
                          <DialogHeader>
                            <DialogTitle>Roll Verification</DialogTitle>
                            <DialogDescription>
                              <div className="space-y-4 mt-4">
                                <div>
                                  <span className="text-gray-400 block mb-1">Bet Type:</span>
                                  <div className="bg-black p-2 rounded text-xs font-mono">{formatBetType(game)}</div>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-1">Server Seed (Revealed):</span>
                                  <div className="bg-black p-2 rounded text-xs break-all font-mono">
                                    {game.serverSeedRevealed}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-1">Server Seed Hash:</span>
                                  <div className="bg-black p-2 rounded text-xs break-all font-mono">
                                    {game.serverSeed}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-1">Client Seed:</span>
                                  <div className="bg-black p-2 rounded text-xs break-all font-mono">
                                    {game.clientSeed}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-1">Nonce:</span>
                                  <div className="bg-black p-2 rounded text-xs font-mono">{game.nonce}</div>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-1">Result:</span>
                                  <div className="bg-black p-2 rounded text-xs font-mono">
                                    {game.roll} ({game.outcome === "win" ? "Win" : "Loss"})
                                  </div>
                                </div>
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </td>
                    <td className="py-4 px-6 text-gray-400 font-mono">{formatDate(game.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-800">
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadGameHistory(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="bg-[#1f2937] border-gray-700 text-[#0affff] hover:bg-[#1f2937]/80"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === pagination.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => loadGameHistory(page)}
                      className={
                        page === pagination.currentPage
                          ? "bg-[#0affff] text-black hover:bg-[#0affff]/80"
                          : "bg-[#1f2937] border-gray-700 text-[#0affff] hover:bg-[#1f2937]/80"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadGameHistory(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="bg-[#1f2937] border-gray-700 text-[#0affff] hover:bg-[#1f2937]/80"
                >
                  Next
                </Button>
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalBets} total bets)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

