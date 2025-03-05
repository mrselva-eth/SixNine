"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { ArrowUp, ArrowDown, Loader2, DollarSign, Hash, Trophy, Target, TrendingDown } from "lucide-react"
import { fetchBalanceHistory, fetchBettingStats, fetchBettingStatsHistory } from "@/utils/game-contract"
import { BalanceChart } from "@/components/balance-chart"
import { StatsCard } from "@/components/stats-card"
import { StatsChart } from "@/components/stats-chart"

export default function VisualizationPage() {
  const { address } = useAccount()
  const [balanceData, setBalanceData] = useState<{
    history: Array<{ balance: string; timestamp: Date }>
    change: { amount: string; percentage: string; isPositive: boolean }
  }>({
    history: [],
    change: { amount: "0", percentage: "0", isPositive: true },
  })
  const [bettingStats, setBettingStats] = useState<{
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
  }>({
    totalBets: 0,
    totalBetAmount: "0",
    totalWins: 0,
    totalWinAmount: "0",
    totalLosses: 0,
    totalLossAmount: "0",
  })
  const [statsHistory, setStatsHistory] = useState<{
    betCountHistory: Array<{ count: number; timestamp: Date }>
    betAmountHistory: Array<{ amount: string; timestamp: Date }>
    winCountHistory: Array<{ count: number; timestamp: Date }>
    winAmountHistory: Array<{ amount: string; timestamp: Date }>
    lossCountHistory: Array<{ count: number; timestamp: Date }>
    lossAmountHistory: Array<{ amount: string; timestamp: Date }>
  }>({
    betCountHistory: [],
    betAmountHistory: [],
    winCountHistory: [],
    winAmountHistory: [],
    lossCountHistory: [],
    lossAmountHistory: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [timeframe, setTimeframe] = useState(24) // Default to 24 hours

  useEffect(() => {
    async function loadData() {
      if (address) {
        setIsLoading(true)
        try {
          // Fetch all data in parallel
          const [balanceData, bettingStats, statsHistory] = await Promise.all([
            fetchBalanceHistory(address, timeframe),
            fetchBettingStats(address, timeframe),
            fetchBettingStatsHistory(address, timeframe),
          ])

          setBalanceData(balanceData)
          setBettingStats(bettingStats)
          setStatsHistory(statsHistory)
        } catch (error) {
          console.error("Error loading visualization data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadData()
  }, [address, timeframe])

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[#0affff] to-[#0affff]/60 bg-clip-text text-transparent">
        Visualization
      </h1>

      {!address ? (
        <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg text-center">
          <p className="text-gray-400 mb-4">Connect your wallet to view your balance visualization.</p>
        </div>
      ) : isLoading ? (
        <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0affff]" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          {/* Game Balance Card */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#0affff]">Game Balance</h2>
                <div className="text-3xl font-bold mt-2">
                  {balanceData.history.length > 0
                    ? `${balanceData.history[balanceData.history.length - 1].balance} 69USDC`
                    : "0 69USDC"}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-sm text-gray-400">24h Change</div>
                <div
                  className={`flex items-center gap-1 text-xl font-bold ${
                    balanceData.change.isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {balanceData.change.isPositive ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                  {balanceData.change.amount} 69USDC ({balanceData.change.percentage}%)
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Total Bets"
              value={bettingStats.totalBets.toString()}
              percentChange={bettingStats.percentChanges?.totalBets}
              icon={<Hash className="h-5 w-5 text-[#0affff]" />}
            />
            <StatsCard
              title="Total Bet Amount"
              value={`${bettingStats.totalBetAmount} 69USDC`}
              percentChange={bettingStats.percentChanges?.totalBetAmount}
              icon={<DollarSign className="h-5 w-5 text-[#0affff]" />}
            />
            <StatsCard
              title="Total Wins"
              value={bettingStats.totalWins.toString()}
              percentChange={bettingStats.percentChanges?.totalWins}
              icon={<Trophy className="h-5 w-5 text-green-400" />}
            />
            <StatsCard
              title="Total Win Amount"
              value={`${bettingStats.totalWinAmount} 69USDC`}
              percentChange={bettingStats.percentChanges?.totalWinAmount}
              icon={<Target className="h-5 w-5 text-green-400" />}
            />
            <StatsCard
              title="Total Losses"
              value={bettingStats.totalLosses.toString()}
              percentChange={bettingStats.percentChanges?.totalLosses}
              icon={<TrendingDown className="h-5 w-5 text-red-400" />}
            />
            <StatsCard
              title="Total Loss Amount"
              value={`${bettingStats.totalLossAmount} 69USDC`}
              percentChange={bettingStats.percentChanges?.totalLossAmount}
              icon={<DollarSign className="h-5 w-5 text-red-400" />}
            />
          </div>

          {/* Balance History Chart */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#0affff]">Balance History</h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setTimeframe(24)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    timeframe === 24 ? "bg-[#0affff] text-black" : "bg-[#0d1117] text-gray-400 hover:text-white"
                  }`}
                >
                  24h
                </button>
                <button
                  onClick={() => setTimeframe(72)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    timeframe === 72 ? "bg-[#0affff] text-black" : "bg-[#0d1117] text-gray-400 hover:text-white"
                  }`}
                >
                  3d
                </button>
                <button
                  onClick={() => setTimeframe(168)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    timeframe === 168 ? "bg-[#0affff] text-black" : "bg-[#0d1117] text-gray-400 hover:text-white"
                  }`}
                >
                  7d
                </button>
              </div>
            </div>

            <div className="h-[400px] w-full">
              {balanceData.history.length > 0 ? (
                <BalanceChart data={balanceData.history} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No balance history available
                </div>
              )}
            </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bet Count Chart */}
            <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-[#0affff] mb-4">Bet Count History</h2>
              <div className="h-[250px]">
                {statsHistory.betCountHistory.length > 0 ? (
                  <StatsChart
                    title="Bet Count"
                    data={statsHistory.betCountHistory}
                    type="bar"
                    valueType="count"
                    color="#0affff"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No bet count history available
                  </div>
                )}
              </div>
            </div>

            {/* Bet Amount Chart */}
            <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-[#0affff] mb-4">Bet Amount History</h2>
              <div className="h-[250px]">
                {statsHistory.betAmountHistory.length > 0 ? (
                  <StatsChart
                    title="Bet Amount"
                    data={statsHistory.betAmountHistory}
                    type="bar"
                    valueType="amount"
                    color="#0affff"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No bet amount history available
                  </div>
                )}
              </div>
            </div>

            {/* Win Count Chart */}
            <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-[#0affff] mb-4">Win Count History</h2>
              <div className="h-[250px]">
                {statsHistory.winCountHistory.length > 0 ? (
                  <StatsChart
                    title="Win Count"
                    data={statsHistory.winCountHistory}
                    type="line"
                    valueType="count"
                    color="#10b981" // green
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No win count history available
                  </div>
                )}
              </div>
            </div>

            {/* Win Amount Chart */}
            <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-[#0affff] mb-4">Win Amount History</h2>
              <div className="h-[250px]">
                {statsHistory.winAmountHistory.length > 0 ? (
                  <StatsChart
                    title="Win Amount"
                    data={statsHistory.winAmountHistory}
                    type="line"
                    valueType="amount"
                    color="#10b981" // green
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No win amount history available
                  </div>
                )}
              </div>
            </div>

            {/* Loss Count Chart */}
            <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-[#0affff] mb-4">Loss Count History</h2>
              <div className="h-[250px]">
                {statsHistory.lossCountHistory.length > 0 ? (
                  <StatsChart
                    title="Loss Count"
                    data={statsHistory.lossCountHistory}
                    type="line"
                    valueType="count"
                    color="#ef4444" // red
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No loss count history available
                  </div>
                )}
              </div>
            </div>

            {/* Loss Amount Chart */}
            <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-800">
              <h2 className="text-xl font-semibold text-[#0affff] mb-4">Loss Amount History</h2>
              <div className="h-[250px]">
                {statsHistory.lossAmountHistory.length > 0 ? (
                  <StatsChart
                    title="Loss Amount"
                    data={statsHistory.lossAmountHistory}
                    type="line"
                    valueType="amount"
                    color="#ef4444" // red
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No loss amount history available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

