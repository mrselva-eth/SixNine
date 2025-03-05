"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { ArrowRight, Shield, Dice1Icon as Dice, BarChart2, Trophy, Coins } from "lucide-react"
import { fetchLeaderboard } from "@/utils/game-contract"

export default function HomePage() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [topPlayers, setTopPlayers] = useState<Array<{ address: string; balance: string }>>([])

  // Fetch top players for the leaderboard preview
  useEffect(() => {
    async function loadTopPlayers() {
      try {
        const data = await fetchLeaderboard("balance", 3)
        setTopPlayers(data)
      } catch (error) {
        console.error("Error loading top players:", error)
      }
    }

    loadTopPlayers()
  }, [])

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#0affff]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0affff]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#0affff]/20 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#0affff]/15 rounded-full opacity-15"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#0affff]/10 rounded-full opacity-10"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left side - Text content */}
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#0affff] to-[#0affff]/60 bg-clip-text text-transparent">
                  SixNine(69)
                </span>
                <br />
                <span className="text-white">Provably Fair Dice Game</span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-xl">
                Experience the thrill of dice gaming with complete transparency. Bet, win, and verify every roll on the
                Sepolia Ethereum testnet.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/game" className="cti">
                  <span className="CTI">Play Now</span>
                </Link>

                {!isConnected && (
                  <button
                    onClick={openConnectModal}
                    className="px-6 py-4 bg-transparent border-2 border-[#0affff] text-[#0affff] rounded-lg hover:bg-[#0affff]/10 transition-all duration-300 font-bold"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </motion.div>

            {/* Right side - 3D Dice Animation */}
            <motion.div
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-full h-[400px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    {/* Animated dice faces */}
                    <motion.div
                      className="absolute inset-0 bg-[#0affff]/20 rounded-xl border border-[#0affff]/50 flex items-center justify-center text-[#0affff] text-8xl shadow-[0_0_30px_rgba(10,255,255,0.3)]"
                      animate={{
                        rotateY: [0, 180, 360],
                        rotateX: [0, 180, 0],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      <Dice className="w-32 h-32" />
                    </motion.div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border-2 border-dashed border-[#0affff]/30 rounded-full animate-spin-slow"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-[#0affff]/20 rounded-full"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-[#0d1117]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#0affff] to-[#0affff]/60 bg-clip-text text-transparent">
              Game Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              SixNine(69) offers a unique gaming experience with multiple betting options and complete transparency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50 shadow-lg relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#0affff]/10 rounded-bl-3xl transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>

              <div className="mb-4 text-[#0affff]">
                <Dice className="w-12 h-12" />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-white">Multiple Bet Types</h3>
              <p className="text-gray-300">
                Choose from Classic, Specific Number, Odd/Even, or Range betting options with different multipliers.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50 shadow-lg relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#0affff]/10 rounded-bl-3xl transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>

              <div className="mb-4 text-[#0affff]">
                <Shield className="w-12 h-12" />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-white">Provably Fair</h3>
              <p className="text-gray-300">
                Verify every roll with our transparent system using cryptographic hashes and client seeds.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50 shadow-lg relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#0affff]/10 rounded-bl-3xl transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>

              <div className="mb-4 text-[#0affff]">
                <BarChart2 className="w-12 h-12" />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-white">Detailed Stats</h3>
              <p className="text-gray-300">
                Track your performance with comprehensive statistics and visualizations of your betting history.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50 shadow-lg relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#0affff]/10 rounded-bl-3xl transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>

              <div className="mb-4 text-[#0affff]">
                <Trophy className="w-12 h-12" />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-white">Leaderboard</h3>
              <p className="text-gray-300">
                Compete with other players and climb the ranks based on balance, wins, and other metrics.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50 shadow-lg relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#0affff]/10 rounded-bl-3xl transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>

              <div className="mb-4 text-[#0affff]">
                <Coins className="w-12 h-12" />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-white">69USDC Token</h3>
              <p className="text-gray-300">
                Mint and exchange 69USDC tokens to play the game on the Sepolia Ethereum testnet.
              </p>
            </motion.div>

            {/* Feature 6 - CTA */}
            <motion.div
              className="bg-gradient-to-br from-[#0affff]/20 to-[#0affff]/5 backdrop-blur-md rounded-2xl p-6 border border-[#0affff]/30 shadow-lg relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="h-full flex flex-col justify-center items-center">
                <h3 className="text-2xl font-bold mb-6 text-white text-center">Ready to Play?</h3>
                <Link
                  href="/game"
                  className="group flex items-center gap-2 px-6 py-3 bg-[#0affff] text-black rounded-lg hover:bg-[#0affff]/80 transition-all duration-300 font-bold"
                >
                  Roll the Dice
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#0affff] to-[#0affff]/60 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              SixNine(69) uses a provably fair system to ensure complete transparency and fairness.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50 shadow-lg h-full">
                <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-[#0affff] text-black flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3 text-white mt-4">Connect Wallet</h3>
                <p className="text-gray-300">
                  Connect your wallet to the Sepolia testnet to start playing with 69USDC tokens.
                </p>
              </div>

              {/* Connector line */}
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#0affff]/50"></div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50 shadow-lg h-full">
                <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-[#0affff] text-black flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3 text-white mt-4">Get 69USDC</h3>
                <p className="text-gray-300">
                  Mint 69USDC tokens by exchanging ETH at a rate of 0.0005 ETH = 1 69USDC.
                </p>
              </div>

              {/* Connector line */}
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#0affff]/50"></div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50 shadow-lg h-full">
                <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-[#0affff] text-black flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3 text-white mt-4">Place Your Bet</h3>
                <p className="text-gray-300">
                  Choose your bet type, set your amount, and roll the dice to test your luck.
                </p>
              </div>

              {/* Connector line */}
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#0affff]/50"></div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50 shadow-lg h-full">
                <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-[#0affff] text-black flex items-center justify-center text-xl font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold mb-3 text-white mt-4">Verify & Win</h3>
                <p className="text-gray-300">
                  Verify the fairness of each roll and track your stats as you climb the leaderboard.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview Section */}
      <section className="py-20 bg-gradient-to-b from-[#0d1117] to-black">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#0affff] to-[#0affff]/60 bg-clip-text text-transparent">
              Top Players
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Check out our current leaderboard champions and join the competition.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-[#1a1f2e]/90 to-[#1a1f2e]/70 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Rank</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Player</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPlayers.length > 0 ? (
                      topPlayers.map((player, index) => (
                        <motion.tr
                          key={player.address}
                          className="border-b border-gray-800 hover:bg-[#1f2937]"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                        >
                          <td className="py-4 px-6">
                            {index === 0 ? (
                              <Trophy className="h-6 w-6 text-yellow-400" />
                            ) : index === 1 ? (
                              <Trophy className="h-6 w-6 text-gray-400" />
                            ) : (
                              <Trophy className="h-6 w-6 text-amber-700" />
                            )}
                          </td>
                          <td className="py-4 px-6 font-mono">{formatAddress(player.address)}</td>
                          <td className="py-4 px-6 font-mono">{player.balance} 69USDC</td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-400">
                          No players yet. Be the first to join!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0affff]/20 text-[#0affff] rounded-lg hover:bg-[#0affff]/30 transition-all duration-300"
                >
                  View Full Leaderboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0affff]/10 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-6 text-white">Ready to Test Your Luck?</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join SixNine(69) now and experience the thrill of provably fair dice gaming on the blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/game" className="cti max-w-xs mx-auto sm:mx-0">
                <span className="CTI">Play Now</span>
              </Link>

              {!isConnected && (
                <button
                  onClick={openConnectModal}
                  className="px-6 py-4 bg-transparent border-2 border-[#0affff] text-[#0affff] rounded-lg hover:bg-[#0affff]/10 transition-all duration-300 font-bold max-w-xs mx-auto sm:mx-0"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

