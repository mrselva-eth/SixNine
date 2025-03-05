"use client"

import { useAccount } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { Wallet } from "lucide-react"
import { motion } from "framer-motion"

export function WalletConnectionOverlay() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  if (isConnected) {
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

        <button onClick={openConnectModal} className="cti w-full">
          <span className="CTI">Connect Wallet</span>
        </button>

        <p className="mt-4 text-sm text-gray-500">Make sure you're on the Sepolia testnet to use this platform.</p>
      </motion.div>
    </div>
  )
}

