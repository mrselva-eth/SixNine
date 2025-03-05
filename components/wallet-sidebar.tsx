"use client"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Copy, LogOut, ExternalLink } from "lucide-react"
import { useAccount, useBalance, useDisconnect, useEnsName } from "wagmi"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { use69UsdcBalance, formatTokenBalance } from "@/utils/token-contract"
import { MintDialog } from "./mint-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function WalletSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { address } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { data: ethBalance } = useBalance({ address })
  const { data: tokenBalance } = use69UsdcBalance(address)
  const { disconnect } = useDisconnect()
  const [mintDialogOpen, setMintDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("wallet")

  const [transactions, setTransactions] = useState({
    totalMinted: [] as Array<{
      eth: string
      tokens: string
      txHash: string
      timestamp: Date
    }>,
    totalExchanged: [] as Array<{
      tokens: string
      eth: string
      txHash: string
      timestamp: Date
    }>,
  })

  // Copy address function
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success("Address copied to clipboard!")
    }
  }

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Open Etherscan
  const openEtherscan = () => {
    if (address) {
      window.open(`https://sepolia.etherscan.io/address/${address}`, "_blank")
    }
  }

  const fetchTransactions = useCallback(async () => {
    if (address) {
      try {
        const response = await fetch(`/api/user/transactions?address=${address}`)
        const data = await response.json()

        if (data.success) {
          // Convert timestamp strings to Date objects
          const minted = data.data.totalMinted.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))

          const exchanged = data.data.totalExchanged.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))

          setTransactions({
            totalMinted: minted,
            totalExchanged: exchanged,
          })
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      }
    }
  }, [address])

  // Add this useEffect to fetch transactions when the component mounts or address changes
  useEffect(() => {
    if (address) {
      fetchTransactions()
    }
  }, [address, fetchTransactions])

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[300px] sm:w-[400px] bg-gray-900 border-gray-800 flex flex-col [&>button]:hidden">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="group flex items-center justify-center relative z-10 [transition:all_0.5s_ease] rounded-[0.375rem] p-[5px] cursor-pointer border border-[#999] outline-none focus-visible:outline-0"
            >
              <svg
                fill="currentColor"
                stroke="none"
                strokeWidth="0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 overflow-visible [transition:transform_.35s_ease] group-hover:[transition-delay:.25s] [&_path]:[transition:transform_.35s_ease] group-hover:rotate-45"
              >
                <path
                  className="group-hover:[transform:rotate(112.5deg)_translate(-27.2%,-80.2%)]"
                  d="m3.45,8.83c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31L14.71,2.08c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31L3.84,8.75c-.13.05-.25.08-.38.08Z"
                ></path>
                <path
                  className="group-hover:[transform:rotate(22.5deg)_translate(15.5%,-23%)]"
                  d="m2.02,17.13c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31L21.6,6.94c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31L2.4,17.06c-.13.05-.25.08-.38.08Z"
                ></path>
                <path
                  className="group-hover:[transform:rotate(112.5deg)_translate(-15%,-149.5%)]"
                  d="m8.91,21.99c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31l11.64-4.82c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31l-11.64,4.82c-.13.05-.25.08-.38.08Z"
                ></path>
              </svg>
            </button>
          </div>

          <SheetHeader className="mt-8">
            <SheetTitle className="text-white">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="text-xl font-bold">{ensName || (address && formatAddress(address))}</div>
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Copy size={16} />
                  Copy Address
                </button>
              </div>
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="wallet" className="flex-1" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Wallet Tab */}
            <TabsContent value="wallet">
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2" style={{ borderColor: "#01FFFF" }}>
                  Wallet
                </h2>

                {/* ETH Balance */}
                <div className="flex items-center gap-3 mb-6">
                  <Image src="/eth.png" alt="ETH" width={28} height={28} className="rounded-full" />
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">ETH Balance</div>
                    <div className="font-mono text-xl">
                      {ethBalance ? Number(ethBalance.formatted).toFixed(4) : "0.0000"} ETH
                    </div>
                  </div>
                </div>

                {/* 69USDC Balance */}
                <div className="flex items-center gap-3">
                  <Image src="/69usdc.png" alt="69USDC" width={28} height={28} className="rounded-full" />
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">69USDC Balance</div>
                    <div className="font-mono text-xl">
                      {tokenBalance ? formatTokenBalance(tokenBalance) : "0.00"} 69USDC
                    </div>
                  </div>
                </div>
                {transactions.totalMinted.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Transactions</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {transactions.totalMinted.slice(0, 3).map((tx, i) => (
                        <div key={`mint-${i}`} className="bg-gray-800 p-2 rounded-md text-xs">
                          <div className="flex justify-between">
                            <span className="text-green-400">Minted</span>
                            <span>{new Date(tx.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="mt-1">
                            <span>
                              {tx.tokens} 69USDC for {tx.eth} ETH
                            </span>
                          </div>
                        </div>
                      ))}

                      {transactions.totalExchanged.slice(0, 3).map((tx, i) => (
                        <div key={`exchange-${i}`} className="bg-gray-800 p-2 rounded-md text-xs">
                          <div className="flex justify-between">
                            <span className="text-red-400">Exchanged</span>
                            <span>{new Date(tx.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="mt-1">
                            <span>
                              {tx.tokens} 69USDC for {tx.eth} ETH
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2" style={{ borderColor: "#01FFFF" }}>
                  Settings
                </h2>

                {/* Network Info */}
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2 text-gray-300">Network</h3>
                  <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-md">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Sepolia Testnet</span>
                  </div>
                </div>

                {/* View on Etherscan */}
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2 text-gray-300">Account</h3>
                  <button
                    onClick={openEtherscan}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors w-full py-2"
                  >
                    <ExternalLink size={18} />
                    View on Etherscan
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons - Always visible regardless of tab */}
          <div className="mt-auto pb-6 space-y-4">
            {activeTab === "wallet" && (
              <div className="flex justify-center">
                <button
                  className="mint-button"
                  onClick={() => {
                    // Reset any previous transaction state before opening
                    setMintDialogOpen(true)
                  }}
                >
                  <span>Exchange 69USDC</span>
                  <div id="clip">
                    <div id="leftTop" className="corner"></div>
                    <div id="rightBottom" className="corner"></div>
                    <div id="rightTop" className="corner"></div>
                    <div id="leftBottom" className="corner"></div>
                  </div>
                  <div id="rightArrow" className="arrow"></div>
                  <div id="leftArrow" className="arrow"></div>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                disconnect()
                onClose()
              }}
              className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors w-full justify-center py-2 border border-red-500 rounded-lg hover:bg-red-500/10"
            >
              <LogOut size={20} />
              Disconnect Wallet
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <MintDialog open={mintDialogOpen} onOpenChange={setMintDialogOpen} />
    </>
  )
}

