"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"
import { TransactionOverlay } from "./transaction-overlay"
import { use69UsdcBalance, use69UsdcWrite, formatTokenBalance, approveTokens } from "@/utils/token-contract"
import { useGameContractWrite, depositToGame, updateDeposit, DICE_GAME_CONTRACT_ADDRESS } from "@/utils/game-contract"

interface DepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type TransactionState = {
  status: "idle" | "pending" | "approving" | "success" | "error"
  hash?: `0x${string}`
  message: string
}

export function DepositDialog({ open, onOpenChange, onSuccess }: DepositDialogProps) {
  const [amount, setAmount] = useState("10")
  const [transaction, setTransaction] = useState<TransactionState>({
    status: "idle",
    message: "",
  })

  const { address, isConnected } = useAccount()
  const { data: tokenBalance } = use69UsdcBalance(address)

  const { writeContract: tokenWrite, isPending: isApprovePending, data: approveTxHash } = use69UsdcWrite()
  const { writeContract: gameWrite, isPending: isDepositPending, data: depositTxHash } = useGameContractWrite()

  // Track approve transaction
  const {
    isLoading: isApproveLoading,
    isSuccess: isApproveSuccess,
    isError: isApproveError,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  })

  // Track deposit transaction
  const {
    isLoading: isDepositLoading,
    isSuccess: isDepositSuccess,
    isError: isDepositError,
  } = useWaitForTransactionReceipt({
    hash: depositTxHash,
  })

  // Handle approve effect
  useEffect(() => {
    if (isApprovePending) {
      setTransaction({
        status: "approving",
        message: "Waiting for approval confirmation...",
      })
    } else if (isApproveLoading) {
      setTransaction({
        status: "approving",
        hash: approveTxHash,
        message: "Approving 69USDC tokens...",
      })
    } else if (isApproveSuccess) {
      setTransaction({
        status: "success",
        hash: approveTxHash,
        message: "Approval successful!",
      })
      toast.success("Approval successful")

      // Proceed to deposit after approval
      setTimeout(() => {
        setTransaction({ status: "idle", message: "" })
        executeDeposit() // Call the actual deposit function
      }, 1000)
    } else if (isApproveError) {
      setTransaction({ status: "idle", message: "" })
      toast.error("Approval rejected")
    }
  }, [isApprovePending, isApproveLoading, isApproveSuccess, isApproveError, approveTxHash])

  // Handle deposit effect
  useEffect(() => {
    if (isDepositPending) {
      setTransaction({
        status: "pending",
        message: "Waiting for deposit confirmation...",
      })
    } else if (isDepositLoading) {
      setTransaction({
        status: "pending",
        hash: depositTxHash,
        message: "Depositing 69USDC tokens...",
      })
    } else if (isDepositSuccess && depositTxHash) {
      setTransaction({
        status: "success",
        hash: depositTxHash,
        message: "Deposit successful!",
      })

      // Update MongoDB with deposit info
      if (address) {
        updateDeposit(address, amount, depositTxHash)
          .then(() => {
            toast.success(`Successfully deposited ${amount} 69USDC tokens!`)
            if (onSuccess) onSuccess()

            setTimeout(() => {
              onOpenChange(false)
              setTransaction({ status: "idle", message: "" })
            }, 1500)
          })
          .catch((error) => {
            console.error("Error updating deposit in database:", error)
            toast.error("Deposit recorded on blockchain but failed to update database")
          })
      }
    } else if (isDepositError) {
      setTransaction({ status: "idle", message: "" })
      toast.error("Deposit rejected")
    }
  }, [
    isDepositPending,
    isDepositSuccess,
    depositTxHash,
    address,
    amount,
    onOpenChange,
    onSuccess,
    isDepositLoading,
    isDepositError,
  ])

  // Handle approve
  const handleApprove = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const balance = tokenBalance ? formatTokenBalance(tokenBalance) : "0"
    if (Number.parseFloat(amount) > Number.parseFloat(balance)) {
      toast.error("Insufficient token balance")
      return
    }

    try {
      await approveTokens(tokenWrite, DICE_GAME_CONTRACT_ADDRESS as `0x${string}`, amount)
    } catch (error) {
      console.error("Error approving tokens:", error)
      toast.error("Transaction rejected")
      setTransaction({ status: "idle", message: "" })
    }
  }

  // Execute the actual deposit (after approval)
  const executeDeposit = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    try {
      await depositToGame(gameWrite, amount)
    } catch (error) {
      console.error("Error depositing tokens:", error)
      toast.error("Transaction rejected")
      setTransaction({ status: "idle", message: "" })
    }
  }

  return (
    <>
      {transaction.status !== "idle" && <TransactionOverlay message={transaction.message} />}

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
            <DialogTitle className="text-xl font-bold">Deposit 69USDC</DialogTitle>
            <DialogDescription className="text-gray-400">
              Deposit 69USDC tokens to play the dice game.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3 bg-gray-800 border-gray-700"
                step="1"
                min="1"
              />
            </div>
            <div className="text-sm text-gray-400">
              Your Balance: {tokenBalance ? formatTokenBalance(tokenBalance) : "0.00"} 69USDC
            </div>
          </div>

          <Button
            onClick={handleApprove}
            disabled={transaction.status !== "idle" || !isConnected || Number.parseFloat(amount) <= 0}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
          >
            Deposit Tokens
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

