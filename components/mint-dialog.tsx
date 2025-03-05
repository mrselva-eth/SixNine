"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useMint69Usdc,
  useBurn69Usdc,
  use69UsdcWrite,
  mintTokens,
  burnTokens,
  approveMinter,
  calculateTokenAmount,
  calculateEthAmount,
  use69UsdcBalance,
  formatTokenBalance,
} from "@/utils/token-contract"
import { toast } from "sonner"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"
import { useQueryClient } from "@tanstack/react-query"
import { TransactionOverlay } from "./transaction-overlay"

async function recordMintTransaction(address: string, ethAmount: string, tokensAmount: string, txHash: string) {
  try {
    const response = await fetch("/api/token/mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address, eth: ethAmount, tokens: tokensAmount, txHash }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error recording mint transaction:", error)
    return false
  }
}

async function recordExchangeTransaction(address: string, tokensAmount: string, ethAmount: string, txHash: string) {
  try {
    const response = await fetch("/api/token/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address, tokens: tokensAmount, eth: ethAmount, txHash }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error recording exchange transaction:", error)
    return false
  }
}

interface MintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TransactionState = {
  status: "idle" | "pending" | "approving" | "success" | "error"
  hash?: `0x${string}`
  message: string
  showOverlay: boolean
}

export function MintDialog({ open, onOpenChange }: MintDialogProps) {
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit")
  const [ethAmount, setEthAmount] = useState("0.001")
  const [tokenAmount, setTokenAmount] = useState("2")
  const [transaction, setTransaction] = useState<TransactionState>({
    status: "idle",
    message: "",
    showOverlay: false,
  })

  const { writeContract: mintWrite, isPending: isMintPending, data: mintTxHash } = useMint69Usdc()
  const { writeContract: burnWrite, isPending: isBurnPending, data: burnTxHash } = useBurn69Usdc()
  const { writeContract: tokenWrite, isPending: isApprovePending, data: approveTxHash } = use69UsdcWrite()
  const { address, isConnected } = useAccount()
  const { data: tokenBalance, refetch: refetchBalance } = use69UsdcBalance(address)
  const queryClient = useQueryClient()

  // Track mint transaction
  const {
    isLoading: isMintLoading,
    isSuccess: isMintSuccess,
    isError: isMintError,
  } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  })

  // Track burn transaction
  const {
    isLoading: isBurnLoading,
    isSuccess: isBurnSuccess,
    isError: isBurnError,
  } = useWaitForTransactionReceipt({
    hash: burnTxHash,
  })

  // Track approve transaction
  const {
    isLoading: isApproveLoading,
    isSuccess: isApproveSuccess,
    isError: isApproveError,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  })

  // Helper function to refresh all balances
  const refreshBalances = useCallback(async () => {
    // Refresh token balance
    await refetchBalance()
    // Invalidate all queries to force a refresh
    queryClient.invalidateQueries()
  }, [queryClient, refetchBalance])

  // Update mint transaction effect
  useEffect(() => {
    if (isMintPending) {
      setTransaction({
        status: "pending",
        message: "Waiting for confirmation...",
        showOverlay: true,
      })
    } else if (isMintLoading) {
      setTransaction({
        status: "pending",
        hash: mintTxHash,
        message: "Minting 69USDC tokens...",
        showOverlay: true,
      })
    } else if (isMintSuccess && mintTxHash) {
      // Refresh balances immediately after successful mint
      refreshBalances()

      // Record the mint transaction in MongoDB
      if (address) {
        const tokensAmount = calculateTokenAmount(ethAmount)
        recordMintTransaction(address, ethAmount, tokensAmount, mintTxHash)
          .then(() => {
            setTransaction({
              status: "success",
              hash: mintTxHash,
              message: "Transaction successful!",
              showOverlay: true,
            })
            toast.success(`Successfully minted ${tokensAmount} 69USDC tokens!`)
            setTimeout(() => {
              onOpenChange(false)
              setTransaction({ status: "idle", message: "", showOverlay: false })
            }, 1500)
          })
          .catch((error) => {
            console.error("Error recording mint transaction:", error)
            // Still show success even if recording fails
            setTransaction({
              status: "success",
              hash: mintTxHash,
              message: "Transaction successful!",
              showOverlay: true,
            })
            toast.success(`Successfully minted ${tokensAmount} 69USDC tokens!`)
            setTimeout(() => {
              onOpenChange(false)
              setTransaction({ status: "idle", message: "", showOverlay: false })
            }, 1500)
          })
      }
    } else if (isMintError) {
      setTransaction({ status: "idle", message: "", showOverlay: false })
      toast.error("Transaction rejected")
    }
  }, [
    isMintPending,
    isMintLoading,
    isMintSuccess,
    isMintError,
    mintTxHash,
    ethAmount,
    onOpenChange,
    refreshBalances,
    address,
  ])

  const handleBurn = useCallback(async () => {
    try {
      await burnTokens(burnWrite, tokenAmount)
    } catch (error) {
      console.error("Error withdrawing tokens:", error)
      toast.error("Transaction rejected")
      setTransaction({ status: "idle", message: "", showOverlay: false })
    }
  }, [burnWrite, tokenAmount])

  // Update approve transaction effect
  useEffect(() => {
    if (isApprovePending) {
      setTransaction({
        status: "approving",
        message: "Waiting for approval confirmation...",
        showOverlay: true,
      })
    } else if (isApproveLoading) {
      setTransaction({
        status: "approving",
        hash: approveTxHash,
        message: "Approving 69USDC tokens...",
        showOverlay: true,
      })
    } else if (isApproveSuccess) {
      // Refresh allowances
      refreshBalances()

      setTransaction({
        status: "success",
        hash: approveTxHash,
        message: "Approval successful!",
        showOverlay: true,
      })
      toast.success("Approval successful")
      setTimeout(() => {
        setTransaction({ status: "idle", message: "", showOverlay: true })
        handleBurn()
      }, 1000)
    } else if (isApproveError) {
      setTransaction({ status: "idle", message: "", showOverlay: false })
      toast.error("Transaction rejected")
    }
  }, [isApprovePending, isApproveLoading, isApproveSuccess, isApproveError, approveTxHash, refreshBalances, handleBurn])

  // Update burn transaction effect
  useEffect(() => {
    if (isBurnPending) {
      setTransaction({
        status: "pending",
        message: "Waiting for confirmation...",
        showOverlay: true,
      })
    } else if (isBurnLoading) {
      setTransaction({
        status: "pending",
        hash: burnTxHash,
        message: "Withdrawing ETH...",
        showOverlay: true,
      })
    } else if (isBurnSuccess && burnTxHash) {
      // Refresh balances immediately after successful burn
      refreshBalances()

      // Record the exchange transaction in MongoDB
      if (address) {
        const ethAmount = calculateEthAmount(tokenAmount)
        recordExchangeTransaction(address, tokenAmount, ethAmount, burnTxHash)
          .then(() => {
            setTransaction({
              status: "success",
              hash: burnTxHash,
              message: "Transaction successful!",
              showOverlay: true,
            })
            toast.success(`Successfully withdrawn ${ethAmount} ETH!`)
            setTimeout(() => {
              onOpenChange(false)
              setTransaction({ status: "idle", message: "", showOverlay: false })
            }, 1500)
          })
          .catch((error) => {
            console.error("Error recording exchange transaction:", error)
            // Still show success even if recording fails
            setTransaction({
              status: "success",
              hash: burnTxHash,
              message: "Transaction successful!",
              showOverlay: true,
            })
            toast.success(`Successfully withdrawn ${ethAmount} ETH!`)
            setTimeout(() => {
              onOpenChange(false)
              setTransaction({ status: "idle", message: "", showOverlay: false })
            }, 1500)
          })
      }
    } else if (isBurnError) {
      setTransaction({ status: "idle", message: "", showOverlay: false })
      toast.error("Transaction rejected")
    }
  }, [
    isBurnPending,
    isBurnLoading,
    isBurnSuccess,
    isBurnError,
    burnTxHash,
    tokenAmount,
    onOpenChange,
    refreshBalances,
    address,
  ])

  // Add this new useEffect to detect when a transaction is canceled in the wallet
  useEffect(() => {
    // If we were in a pending state but isPending becomes false without a success or error
    // This likely means the user rejected the transaction in their wallet
    if (
      transaction.showOverlay &&
      ((transaction.status === "pending" &&
        !isMintPending &&
        !isMintLoading &&
        !isMintSuccess &&
        !isMintError &&
        !isBurnPending &&
        !isBurnLoading &&
        !isBurnSuccess &&
        !isBurnError) ||
        (transaction.status === "approving" &&
          !isApprovePending &&
          !isApproveLoading &&
          !isApproveSuccess &&
          !isApproveError))
    ) {
      setTransaction({ status: "idle", message: "", showOverlay: false })
      toast.error("Transaction rejected")
    }
  }, [
    transaction.status,
    transaction.showOverlay,
    isMintPending,
    isMintLoading,
    isMintSuccess,
    isMintError,
    isBurnPending,
    isBurnLoading,
    isBurnSuccess,
    isBurnError,
    isApprovePending,
    isApproveLoading,
    isApproveSuccess,
    isApproveError,
  ])

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!ethAmount || Number.parseFloat(ethAmount) <= 0) {
      toast.error("Please enter a valid ETH amount")
      return
    }

    try {
      setTransaction({
        status: "pending",
        message: "Preparing transaction...",
        showOverlay: true,
      })

      // Add a timeout to detect if the transaction was not initiated
      const timeoutId = setTimeout(() => {
        if (transaction.showOverlay && !isMintPending && !isMintLoading) {
          setTransaction({ status: "idle", message: "", showOverlay: false })
        }
      }, 3000) // 3 seconds timeout

      await mintTokens(mintWrite, ethAmount)

      // Clear the timeout if the transaction was initiated
      clearTimeout(timeoutId)
    } catch (error) {
      console.error("Error minting tokens:", error)
      toast.error("Transaction rejected")
      setTransaction({ status: "idle", message: "", showOverlay: false })
    }
  }

  const handleApprove = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!tokenAmount || Number.parseFloat(tokenAmount) <= 0) {
      toast.error("Please enter a valid token amount")
      return
    }

    const balance = tokenBalance ? formatTokenBalance(tokenBalance) : "0"
    if (Number.parseFloat(tokenAmount) > Number.parseFloat(balance)) {
      toast.error("Insufficient token balance")
      return
    }

    try {
      setTransaction({
        status: "pending",
        message: "Preparing approval...",
        showOverlay: true,
      })

      // Add a timeout to detect if the transaction was not initiated
      const timeoutId = setTimeout(() => {
        if (transaction.showOverlay && !isApprovePending && !isApproveLoading) {
          setTransaction({ status: "idle", message: "", showOverlay: false })
        }
      }, 3000) // 3 seconds timeout

      await approveMinter(tokenWrite, tokenAmount)

      // Clear the timeout if the transaction was initiated
      clearTimeout(timeoutId)
    } catch (error) {
      console.error("Error approving tokens:", error)
      toast.error("Transaction rejected")
      setTransaction({ status: "idle", message: "", showOverlay: false })
    }
  }

  const handleWithdraw = async () => {
    await handleApprove()
  }

  // Add a cleanup function to the component to ensure transaction state is reset when unmounting
  useEffect(() => {
    return () => {
      // Reset transaction state when component unmounts
      setTransaction({ status: "idle", message: "", showOverlay: false })
    }
  }, [])

  // Add a new useEffect to handle dialog close events
  useEffect(() => {
    if (!open) {
      // Reset transaction state when dialog is closed
      setTransaction({ status: "idle", message: "", showOverlay: false })
    }
  }, [open])

  // Handle close overlay
  const handleCloseOverlay = () => {
    setTransaction((prev) => ({ ...prev, showOverlay: false }))
  }

  return (
    <>
      {transaction.showOverlay && (
        <TransactionOverlay message={transaction.message} status={transaction.status} onClose={handleCloseOverlay} />
      )}

      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          // Only allow closing if not in a transaction
          if (transaction.status === "idle" || !newOpen) {
            onOpenChange(newOpen)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">69USDC Exchange</DialogTitle>
            <DialogDescription className="text-gray-400">
              Exchange between Sepolia ETH and 69USDC tokens.
              <br />
              Rate: 0.0005 ETH = 1 69USDC
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="deposit"
            className="w-full"
            onValueChange={(value: string) => setMode(value as "deposit" | "withdraw")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="mt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ethAmount" className="text-right">
                    ETH Amount
                  </Label>
                  <Input
                    id="ethAmount"
                    type="number"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    className="col-span-3 bg-gray-800 border-gray-700"
                    step="0.0001"
                    min="0.0001"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">You Get</Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <span className="text-xl font-bold text-cyan-400">{calculateTokenAmount(ethAmount)}</span>
                    <span>69USDC</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleDeposit}
                disabled={transaction.status !== "idle" || !isConnected || Number.parseFloat(ethAmount) <= 0}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold mt-4"
              >
                Mint Tokens
              </Button>
            </TabsContent>

            <TabsContent value="withdraw" className="mt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tokenAmount" className="text-right">
                    69USDC Amount
                  </Label>
                  <Input
                    id="tokenAmount"
                    type="number"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    className="col-span-3 bg-gray-800 border-gray-700"
                    step="1"
                    min="1"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">You Get</Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <span className="text-xl font-bold text-cyan-400">{calculateEthAmount(tokenAmount)}</span>
                    <span>ETH</span>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Your Balance: {tokenBalance ? formatTokenBalance(tokenBalance) : "0.00"} 69USDC
                </div>
              </div>

              <Button
                onClick={handleWithdraw}
                disabled={transaction.status !== "idle" || !isConnected || Number.parseFloat(tokenAmount) <= 0}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold mt-4"
              >
                Withdraw ETH
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}

