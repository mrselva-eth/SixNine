"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RefreshCw, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { fetchGameBalance, placeBet } from "@/utils/game-contract"
import { DepositDialog } from "./deposit-dialog"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Dice components for visual representation
const DiceIcons = [
  <Dice1 key={1} className="w-full h-full" />,
  <Dice2 key={2} className="w-full h-full" />,
  <Dice3 key={3} className="w-full h-full" />,
  <Dice4 key={4} className="w-full h-full" />,
  <Dice5 key={5} className="w-full h-full" />,
  <Dice6 key={6} className="w-full h-full" />,
]

// Define bet types and their multipliers
type BetType = "classic" | "specific" | "odd-even" | "range"

interface BetOption {
  type: BetType
  label: string
  description: string
  multiplier: number
  checkWin: (roll: number, option?: string) => boolean
}

const betOptions: Record<BetType, BetOption> = {
  classic: {
    type: "classic",
    label: "Classic",
    description: "Win on 4, 5, or 6",
    multiplier: 2,
    checkWin: (roll) => roll >= 4,
  },
  specific: {
    type: "specific",
    label: "Specific Number",
    description: "Bet on a specific number (1-6)",
    multiplier: 6,
    checkWin: (roll, option) => roll === Number(option),
  },
  "odd-even": {
    type: "odd-even",
    label: "Odd/Even",
    description: "Bet on odd or even numbers",
    multiplier: 2,
    checkWin: (roll, option) => (option === "odd" ? roll % 2 === 1 : roll % 2 === 0),
  },
  range: {
    type: "range",
    label: "Range",
    description: "Bet on a range of numbers",
    multiplier: 3,
    checkWin: (roll, option) => {
      if (option === "low") return roll >= 1 && roll <= 2
      if (option === "mid") return roll >= 3 && roll <= 4
      if (option === "high") return roll >= 5 && roll <= 6
      return false
    },
  },
}

export default function DiceGame() {
  const { isConnected, address } = useAccount()
  const { openConnectModal } = useConnectModal()

  // Game state
  const [balance, setBalance] = useState("0")
  const [bet, setBet] = useState(10)
  const [isRolling, setIsRolling] = useState(false)
  const [currentRoll, setCurrentRoll] = useState<number | null>(null)
  const [clientSeed, setClientSeed] = useState("")
  const [nonce, setNonce] = useState(0)
  const [serverSeedHash, setServerSeedHash] = useState("")
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null)
  const [showRollHistory, setShowRollHistory] = useState(false)

  // New state for betting options
  const [activeBetType, setActiveBetType] = useState<BetType>("classic")
  const [specificNumber, setSpecificNumber] = useState<number>(1)
  const [oddEvenChoice, setOddEvenChoice] = useState<"odd" | "even">("odd")
  const [rangeChoice, setRangeChoice] = useState<"low" | "mid" | "high">("low")

  // Add state for the result message
  const [resultMessage, setResultMessage] = useState<{
    type: "win" | "lose" | null
    amount: number | null
    multiplier?: number
  }>({ type: null, amount: null })

  // Add a new state for tracking roll history after the other state declarations
  const [rollHistory, setRollHistory] = useState<Array<{ roll: number; outcome: "win" | "lose" }>>([])

  // Fetch game balance from MongoDB
  const fetchBalance = useCallback(async () => {
    if (address) {
      const gameBalance = await fetchGameBalance(address)
      setBalance(gameBalance)
    }
  }, [address])

  // Generate a random client seed on first load
  useEffect(() => {
    // Generate random client seed
    const randomSeed = Math.random().toString(36).substring(2, 15)
    setClientSeed(randomSeed)

    // Get initial server seed hash
    fetchNewServerSeed()
  }, [])

  // Fetch balance when address changes
  useEffect(() => {
    if (address) {
      fetchBalance()
    } else {
      setBalance("0")
    }
  }, [address, fetchBalance])

  // Fetch a new server seed hash from the API
  const fetchNewServerSeed = async () => {
    try {
      const response = await fetch("/api/new-seed")
      const data = await response.json()
      setServerSeedHash(data.serverSeedHash)
    } catch (error) {
      console.error("Error fetching new server seed:", error)
      toast.error("Failed to get new server seed")
    }
  }

  // Update the setBetPercentage function to properly handle slider value
  const setBetPercentage = (percentage: number) => {
    const maxBet = Number(balance)
    const newBet = Math.floor(maxBet * (percentage / 100))
    setBet(newBet)
    setSelectedPercentage(percentage)
  }

  // Update handleBetChange to calculate percentage correctly
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    const maxBet = Number(balance)

    if (!isNaN(value) && value >= 0 && value <= maxBet) {
      setBet(value)
      // Calculate and set the percentage
      const percentage = (value / maxBet) * 100
      if ([10, 25, 50, 100].includes(Math.round(percentage))) {
        setSelectedPercentage(Math.round(percentage))
      } else {
        setSelectedPercentage(null)
      }
    }
  }

  // Update handleSliderChange to calculate percentage correctly
  const handleSliderChange = (value: number[]) => {
    const maxBet = Number(balance)
    const newBet = value[0]
    setBet(newBet)

    // Calculate and set the percentage
    const percentage = (newBet / maxBet) * 100
    if ([10, 25, 50, 100].includes(Math.round(percentage))) {
      setSelectedPercentage(Math.round(percentage))
    } else {
      setSelectedPercentage(null)
    }
  }

  // Get the current bet option based on active bet type
  const getCurrentBetOption = (): string | undefined => {
    switch (activeBetType) {
      case "specific":
        return specificNumber.toString()
      case "odd-even":
        return oddEvenChoice
      case "range":
        return rangeChoice
      default:
        return undefined
    }
  }

  // Check if the roll is a win based on the current bet type and option
  const isWin = (roll: number): boolean => {
    const option = getCurrentBetOption()
    return betOptions[activeBetType].checkWin(roll, option)
  }

  // Get the current multiplier
  const getCurrentMultiplier = (): number => {
    return betOptions[activeBetType].multiplier
  }

  // Update the rollDice function to include bet type information when placing the bet
  const rollDice = async () => {
    // Validate bet amount
    if (bet <= 0) {
      toast.error("Please enter a valid bet amount")
      return
    }

    if (bet > Number(balance)) {
      toast.error("Bet amount exceeds your balance")
      return
    }

    setIsRolling(true)
    setResultMessage({ type: null, amount: null }) // Clear previous message

    try {
      // Get the current bet option based on active bet type
      const currentOption = getCurrentBetOption()
      const currentMultiplier = getCurrentMultiplier()

      const result = await placeBet(
        address as string,
        bet,
        clientSeed,
        nonce,
        serverSeedHash,
        activeBetType,
        currentOption,
        currentMultiplier,
      )

      if (!result) {
        throw new Error("Failed to place bet")
      }

      // Simulate rolling animation
      let rollCount = 0
      const rollInterval = setInterval(() => {
        setCurrentRoll(Math.floor(Math.random() * 6) + 1)
        rollCount++

        if (rollCount >= 10) {
          clearInterval(rollInterval)

          // Set the actual roll result
          setCurrentRoll(result.roll)

          // Check if the roll is a win based on the current bet type
          const win = isWin(result.roll)
          const multiplier = getCurrentMultiplier()

          // Update roll history
          setRollHistory((prev) => {
            const newHistory = [
              ...prev,
              {
                roll: result.roll,
                outcome: win ? ("win" as const) : ("lose" as const),
              },
            ]
            // Keep only the last 10 rolls
            if (newHistory.length > 10) {
              return newHistory.slice(newHistory.length - 10)
            }
            return newHistory
          })

          // Update balance
          if (win) {
            const winAmount = bet * multiplier // This is the total amount including the original bet
            setBalance((prevBalance) => (BigInt(prevBalance) + BigInt(winAmount - bet)).toString())
            setResultMessage({ type: "win", amount: winAmount - bet, multiplier })
          } else {
            setBalance((prevBalance) => (BigInt(prevBalance) - BigInt(bet)).toString())
            setResultMessage({ type: "lose", amount: bet })
          }

          // Update other state
          setNonce((prev) => prev + 1)
          setServerSeedHash(result.nextServerSeedHash)

          // Refresh the actual balance from DB
          setTimeout(() => {
            fetchBalance()
          }, 1000)

          setIsRolling(false)
        }
      }, 100)
    } catch (error) {
      console.error("Error rolling dice:", error)
      toast.error("Failed to roll dice")
      setIsRolling(false)
    }
  }

  // Change client seed
  const changeClientSeed = () => {
    const newSeed = prompt("Enter new client seed:", clientSeed)
    if (newSeed && newSeed.trim() !== "") {
      setClientSeed(newSeed.trim())
      toast.success("Client seed updated")
    }
  }

  // Add a useEffect to clear the result message after 3 seconds
  useEffect(() => {
    if (resultMessage.type) {
      const timer = setTimeout(() => {
        setResultMessage({ type: null, amount: null })
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [resultMessage.type])

  // Render the bet options UI based on the active bet type
  const renderBetOptions = () => {
    switch (activeBetType) {
      case "specific":
        return (
          <div className="grid grid-cols-6 gap-2 mt-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <Button
                key={num}
                variant="outline"
                size="sm"
                onClick={() => setSpecificNumber(num)}
                className={`h-12 text-lg transition-all duration-200 ${
                  specificNumber === num
                    ? "bg-[#0affff] text-black border-[#0affff] hover:bg-[#0affff]/80 hover:border-[#0affff]/80"
                    : "bg-[#0d1117] text-white border-gray-700 hover:bg-[#0d1117]/80 hover:text-[#0affff]"
                }`}
              >
                {num}
              </Button>
            ))}
          </div>
        )

      case "odd-even":
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setOddEvenChoice("odd")}
              className={`h-12 text-lg transition-all duration-200 ${
                oddEvenChoice === "odd"
                  ? "bg-[#0affff] text-black border-[#0affff] hover:bg-[#0affff]/80 hover:border-[#0affff]/80"
                  : "bg-[#0d1117] text-white border-gray-700 hover:bg-[#0d1117]/80 hover:text-[#0affff]"
              }`}
            >
              Odd (1,3,5)
            </Button>
            <Button
              variant="outline"
              onClick={() => setOddEvenChoice("even")}
              className={`h-12 text-lg transition-all duration-200 ${
                oddEvenChoice === "even"
                  ? "bg-[#0affff] text-black border-[#0affff] hover:bg-[#0affff]/80 hover:border-[#0affff]/80"
                  : "bg-[#0d1117] text-white border-gray-700 hover:bg-[#0d1117]/80 hover:text-[#0affff]"
              }`}
            >
              Even (2,4,6)
            </Button>
          </div>
        )

      case "range":
        return (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setRangeChoice("low")}
              className={`h-12 text-lg transition-all duration-200 ${
                rangeChoice === "low"
                  ? "bg-[#0affff] text-black border-[#0affff] hover:bg-[#0affff]/80 hover:border-[#0affff]/80"
                  : "bg-[#0d1117] text-white border-gray-700 hover:bg-[#0d1117]/80 hover:text-[#0affff]"
              }`}
            >
              Low (1-2)
            </Button>
            <Button
              variant="outline"
              onClick={() => setRangeChoice("mid")}
              className={`h-12 text-lg transition-all duration-200 ${
                rangeChoice === "mid"
                  ? "bg-[#0affff] text-black border-[#0affff] hover:bg-[#0affff]/80 hover:border-[#0affff]/80"
                  : "bg-[#0d1117] text-white border-gray-700 hover:bg-[#0d1117]/80 hover:text-[#0affff]"
              }`}
            >
              Mid (3-4)
            </Button>
            <Button
              variant="outline"
              onClick={() => setRangeChoice("high")}
              className={`h-12 text-lg transition-all duration-200 ${
                rangeChoice === "high"
                  ? "bg-[#0affff] text-black border-[#0affff] hover:bg-[#0affff]/80 hover:border-[#0affff]/80"
                  : "bg-[#0d1117] text-white border-gray-700 hover:bg-[#0d1117]/80 hover:text-[#0affff]"
              }`}
            >
              High (5-6)
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#0affff]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0affff]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#0affff]/20 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#0affff]/15 rounded-full opacity-15"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#0affff]/10 rounded-full opacity-10"></div>
      </div>

      {/* Result Message Banner */}
      <AnimatePresence>
        {resultMessage.type && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-20 right-0 left-0 z-50 p-4",
              resultMessage.type === "win" ? "bg-green-500/10" : "bg-red-500/10"
            )}
          >
            <div className="max-w-screen-xl mx-auto flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  resultMessage.type === "win" ? "text-green-400" : "text-red-400"
                )}
              >
                {resultMessage.type === "win" ? (
                  <>
                    You won {resultMessage.amount} 69USDC {resultMessage.multiplier && `(${resultMessage.multiplier}x)`}
                  </>
                ) : (
                  <>You lost {resultMessage.amount} 69USDC</>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Previous Rolls - Vertical display in top-right corner */}
      <div className="fixed top-24 right-4 z-40">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-[#1a1f2e]/90 backdrop-blur-sm p-2 rounded-xl border border-gray-800 shadow-lg" style={{ width: '60px' }}>
                <h3 className="text-center text-[#0affff] font-bold mb-2">PR</h3>
                <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
                  {rollHistory.length > 0 ? (
                    rollHistory.map((item, index) => (
                      <motion.div
                        key={`history-${index}-${item.roll}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                          item.outcome === "win"
                            ? "bg-[#0affff]/20 text-[#0affff] border border-[#0affff]/50"
                            : "bg-red-600/20 text-red-400 border border-red-500/50"
                        }`}
                      >
                        {item.roll}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-xs text-center p-2">No rolls yet</div>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Previous Rolls</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Main Game Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 z-10">
        {/* Game Balance Display - Top Section */}
        <div className="mb-8 bg-gradient-to-r from-[#1a1f2e]/80 to-[#1a1f2e]/60 backdrop-blur-md p-6 rounded-2xl border border-[#0affff]/20 shadow-[0_0_15px_rgba(10,255,255,0.1)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-[#0affff]">Your Game Balance</h2>
              <div className="text-3xl font-bold text-white font-mono">{balance} 69USDC</div>
            </div>
            
            {Number(balance) <= 0 && isConnected && (
              <button
                onClick={() => setIsDepositOpen(true)}
                className="px-6 py-3 bg-[#0affff]/20 hover:bg-[#0affff]/30 text-[#0affff] rounded-xl border border-[#0affff]/30 transition-all duration-300 shadow-[0_0_10px_rgba(10,255,255,0.2)]"
              >
                Deposit 69USDC to Play
              </button>
            )}
          </div>
        </div>

        {/* Main Game Area - Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Dice Display */}
          <div className="lg:col-span-5 xl:col-span-4 order-2 lg:order-1">
            <div className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-800/50 h-full flex flex-col items-center justify-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0affff]/30 to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0affff]/30 to-transparent"></div>
              
              <h2 className="text-xl font-semibold mb-8 text-[#0affff]">Current Roll</h2>

              <div className="relative w-48 h-48 mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-[#0affff]/20 animate-ping opacity-20"></div>
                <AnimatePresence mode="wait">
                  {currentRoll ? (
                    <motion.div
                      key={`dice-${currentRoll}-${Date.now()}`}
                      initial={{ rotateY: 0, scale: 0.5, opacity: 0 }}
                      animate={{ rotateY: 360, scale: 1, opacity: 1 }}
                      exit={{ rotateY: 0, scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`w-full h-full rounded-xl flex items-center justify-center p-4 ${
                        currentRoll && isWin(currentRoll)
                          ? "bg-[#0affff]/20 text-[#0affff] shadow-[0_0_20px_rgba(10,255,255,0.3)]"
                          : "bg-red-600/20 text-red-400 shadow-[0_0_20px_rgba(255,0,0,0.2)]"
                      }`}
                    >
                      {currentRoll && DiceIcons[currentRoll - 1]}
                    </motion.div>
                  ) : (
                    <div className="w-full h-full rounded-xl bg-[#0d1117]/80 flex items-center justify-center text-gray-500 border border-gray-800/50">
                      Roll to play
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {currentRoll && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-2xl font-bold mb-4 ${currentRoll && isWin(currentRoll) ? "text-[#0affff]" : "text-red-400"}`}
                >
                  {currentRoll && isWin(currentRoll) ? "You Win!" : "You Lose"}
                </motion.div>
              )}

              <div className="mt-2 text-sm text-gray-400">
                {activeBetType === "classic" && <p>Win on: 4, 5, 6</p>}
                {activeBetType === "specific" && <p>Win on: {specificNumber}</p>}
                {activeBetType === "odd-even" && (
                  <p>Win on: {oddEvenChoice === "odd" ? "Odd numbers (1,3,5)" : "Even numbers (2,4,6)"}</p>
                )}
                {activeBetType === "range" && (
                  <p>Win on: {rangeChoice === "low" ? "1-2" : rangeChoice === "mid" ? "3-4" : "5-6"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Bet Controls */}
          <div className="lg:col-span-7 xl:col-span-5 order-1 lg:order-2">
            <div className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-800/50 relative overflow-hidden">
              {/* Decorative corner elements */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0affff]/10 rotate-45 transform origin-top-right"></div>
              </div>
              <div className="absolute bottom-0 left-0 w-16 h-16 overflow-hidden">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#0affff]/10 rotate-45 transform origin-bottom-left"></div>
              </div>
              
              <div className="p-6">
                {/* Bet Type Selection */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-[#0affff]">Bet Type</h2>
                  <Tabs value={activeBetType} onValueChange={(value) => setActiveBetType(value as BetType)}>
                    <TabsList className="grid grid-cols-2 mb-2">
                      <TabsTrigger value="classic">Classic</TabsTrigger>
                      <TabsTrigger value="specific">Specific</TabsTrigger>
                    </TabsList>
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="odd-even">Odd/Even</TabsTrigger>
                      <TabsTrigger value="range">Range</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{betOptions[activeBetType].description}</span>
                        <span className="text-[#0affff]">{betOptions[activeBetType].multiplier}x</span>
                      </div>
                    </div>

                    {renderBetOptions()}
                  </Tabs>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-[#0affff]">Place Your Bet</h2>
                  <Input
                    type="number"
                    value={bet}
                    onChange={handleBetChange}
                    className="mb-4 bg-[#0d1117]/80 border-gray-700 text-white font-mono"
                    min={0}
                    max={Number(balance)}
                  />
                  <div className="relative my-6">
                    <Slider
                      value={[bet]}
                      max={Number(balance)}
                      step={1}
                      onValueChange={handleSliderChange}
                      className="my-4"
                    />
                  </div>
                  <div className="flex justify-between gap-2 mt-4">
                    {[10, 25, 50].map((percent) => (
                      <Button
                        key={percent}
                        variant="outline"
                        size="sm"
                        onClick={() => setBetPercentage(percent)}
                        className={`flex-1 h-10 text-sm transition-all duration-200 ${
                          selectedPercentage === percent
                            ? "bg-[#0affff] text-black border-[#0affff] hover:bg-[#0affff]/80 hover:border-[#0affff]/80"
                            : "bg-[#0d1117]/80 text-white border-gray-700 hover:bg-[#0d1117]/80 hover:text-[#0affff]"
                        }`}
                      >
                        {percent}%
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBetPercentage(100)}
                      className={`flex-1 h-10 text-sm transition-all duration-200 ${
                        selectedPercentage === 100
                          ? "bg-[#0affff] text-black border-[#0affff] hover:bg-[#0affff]/80 hover:border-[#0affff]/80"
                          : "bg-[#0d1117]/80 text-white border-gray-700 hover:bg-[#0d1117]/80 hover:text-[#0affff]"
                      }`}
                    >
                      Max
                    </Button>
                  </div>
                </div>

                <button
                  onClick={isConnected ? (Number(balance) > 0 ? rollDice : () => setIsDepositOpen(true)) : openConnectModal}
                  disabled={isConnected && (isRolling || bet <= 0 || bet > Number(balance))}
                  className="cti w-full relative group"
                  style={{ opacity: isConnected && (isRolling || bet <= 0 || bet > Number(balance)) ? 0.5 : 1 }}
                >
                  <span className="CTI">
                    {isRolling
                      ? "Rolling..."
                      : isConnected
                        ? Number(balance) > 0
                          ? "Roll Dice"
                          : "Deposit to Play"
                        : "Connect Wallet"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Provably Fair */}
          <div className="lg:col-span-12 xl:col-span-3 order-3">
            <div className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-800/50 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#0affff]/10">
                  <circle cx="70" cy="30" r="20" fill="currentColor" />
                </svg>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#0affff]">Provably Fair</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#0affff] hover:text-[#0affff]/80 hover:bg-[#0d1117]"
                    >
                      <Info className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1a1f2e] border-gray-800">
                    <DialogHeader>
                      <DialogTitle className="text-[#0affff]">How Provably Fair Works</DialogTitle>
                      <DialogDescription className="text-gray-300">
                        <p className="mb-4">Our dice game uses a provably fair system to ensure complete transparency:</p>
                        <ol className="list-decimal pl-5 space-y-3">
                          <li>The server generates a random seed and sends you its SHA-256 hash before you play.</li>
                          <li>You can provide your own client seed or use our randomly generated one.</li>
                          <li>After each roll, the server reveals the original seed used to generate the result.</li>
                          <li>
                            You can verify that the hash of the revealed seed matches the hash you received before
                            playing.
                          </li>
                          <li>
                            The roll result is calculated using: HMAC-SHA256(serverSeed, clientSeed + nonce) mod 6 + 1
                          </li>
                        </ol>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-6 text-sm">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Server Seed Hash:</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchNewServerSeed}
                      className="text-[#0affff] hover:text-[#0affff]/80 hover:bg-[#0d1117] h-6 w-6"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-[#0d1117]/80 p-3 rounded text-xs break-all font-mono text-gray-300 border border-gray-800/50">
                    {serverSeedHash || "Loading..."}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Client Seed:</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={changeClientSeed}
                      className="text-[#0affff] hover:text-[#0affff]/80 hover:bg-[#0d1117] h-6 w-6"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-[#0d1117]/80 p-3 rounded text-xs break-all font-mono text-gray-300 border border-gray-800/50">
                    {clientSeed}
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block mb-2">Nonce:</span>
                  <div className="bg-[#0d1117]/80 p-3 rounded text-xs font-mono text-gray-300 border border-gray-800/50">
                    {nonce}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DepositDialog open={isDepositOpen} onOpenChange={setIsDepositOpen} onSuccess={fetchBalance} />
    </div>
  )}

