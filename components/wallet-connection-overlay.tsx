"use client"

import { useAccount } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { Wallet, Home } from "lucide-react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function WalletConnectionOverlay() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const pathname = usePathname()

  // Don't show overlay on home page
  if (isConnected || pathname === "/") {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1a1f2e] p-8 rounded-xl border border-gray-800 max-w-md w-full text-center shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#0affff]/20 flex items-center justify-center">
            <Wallet className="h-10 w-10 text-[#0affff]" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h2>

        <p className="text-gray-400 mb-6">
          You need to connect your wallet to access the SixNine(69) platform. Connect with MetaMask or any other
          supported wallet to continue.
        </p>

        <div className="space-y-4">
          <button onClick={openConnectModal} className="cti w-full">
            <span className="CTI">Connect Wallet</span>
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-transparent border-2 border-[#0affff] text-[#0affff] rounded-lg hover:bg-[#0affff]/10 transition-all duration-300 font-bold"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-500">Make sure you're on the Sepolia testnet to use this platform.</p>
      </motion.div>
    </div>
  )
}

