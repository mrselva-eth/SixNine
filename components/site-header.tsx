"use client"
import { useState, useEffect, useCallback } from "react"
import { CustomConnectButton } from "./custom-connect-button"
import Image from "next/image"
import Link from "next/link"
import { useAccount } from "wagmi"
import { use69UsdcBalance } from "@/utils/token-contract"
import { fetchGameBalance } from "@/utils/game-contract"
import { WithdrawDialog } from "./withdraw-dialog"

export function SiteHeader() {
  const { address } = useAccount()
  const { data: tokenBalance, refetch } = use69UsdcBalance(address)
  const [gameBalance, setGameBalance] = useState("0")
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  // Fetch game balance from MongoDB
  const fetchBalance = useCallback(async () => {
    if (address) {
      const balance = await fetchGameBalance(address)
      setGameBalance(balance)
    }
  }, [address])

  // Automatically refresh balances periodically
  useEffect(() => {
    // Set up an interval to refresh balances
    const intervalId = setInterval(() => {
      refetch()
      fetchBalance()
    }, 5000) // Refresh every 5 seconds

    // Clear interval on component unmount
    return () => clearInterval(intervalId)
  }, [refetch, fetchBalance])

  // Listen for network/account changes and refresh balances
  useEffect(() => {
    if (address) {
      refetch()
      fetchBalance()
    } else {
      setGameBalance("0")
    }
  }, [address, refetch, fetchBalance])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="relative w-full h-20">
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <Link href="/">
              <Image src="/logo.png" alt="Project Logo" width={200} height={75} className="object-contain" priority />
            </Link>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Image src="/69usdc.png" alt="69USDC" width={30} height={30} />
              <span className="text-white font-bold">Game Balance:</span>
              <div className="border border-[#01ffff] px-4 py-1">
                <span className="text-white font-bold text-2xl">{gameBalance}</span>
              </div>
              {address && Number(gameBalance) > 0 && (
                <button
                  onClick={() => setIsWithdrawOpen(true)}
                  className="ml-2 px-3 py-1 bg-cyan-500 text-black rounded-md text-sm font-bold hover:bg-cyan-600"
                >
                  Transfer to Wallet
                </button>
              )}
            </div>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <CustomConnectButton />
          </div>
        </div>
      </header>

      <WithdrawDialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen} onSuccess={fetchBalance} />
    </>
  )
}

