"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"
import { TransactionOverlay } from "./transaction-overlay"
import { useGameContractWrite, withdrawFromGame, updateWithdrawal, fetchGameBalance } from "@/utils/game-contract"

interface WithdrawDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type TransactionState = {
  status: "idle" | "pending" | "success" | "error"
  hash?: `0x${string}`
  message: string
}

export function WithdrawDialog({ open, onOpenChange, onSuccess }: WithdrawDialogProps) {
  const [amount, setAmount] = useState("10")
  const [gameBalance, setGameBalance] = useState("0")
  const [transaction, setTransaction] = useState<TransactionState>({
    status: "idle",
    message: "",
  })

  const { address, isConnected } = useAccount()
  const { writeContract: gameWrite, isPending: isWithdrawPending, data: withdrawTxHash } = useGameContractWrite()

  // Track withdraw transaction
  const {
    isLoading: isWithdrawLoading,
    isSuccess: isWithdrawSuccess,
    isError: isWithdrawError,
  } = useWaitForTransactionReceipt({
    hash: withdrawTxHash,
  })

  // Fetch game balance when dialog opens
  useEffect(() => {
    if (open && address) {
      fetchGameBalance(address).then((balance) => {
        setGameBalance(balance)
      })
    }
  }, [open, address])

  // Handle withdraw effect
  useEffect(() => {
    if (isWithdrawPending) {
      setTransaction({
        status: "pending",
        message: "Waiting for withdrawal confirmation...",
      })
    } else if (isWithdrawLoading) {
      setTransaction({
        status: "pending",
        hash: withdrawTxHash,
        message: "Withdrawing 69USDC tokens...",
      })
    } else if (isWithdrawSuccess && withdrawTxHash) {
      setTransaction({
        status: "success",
        hash: withdrawTxHash,
        message: "Withdrawal successful!",
      })

      // Update MongoDB with withdrawal info
      if (address) {
        updateWithdrawal(address, amount, withdrawTxHash)
          .then(() => {
            toast.success(`Successfully withdrawn ${amount} 69USDC tokens!`)
            if (onSuccess) onSuccess()

            setTimeout(() => {
              onOpenChange(false)
              setTransaction({ status: "idle", message: "" })
            }, 1500)
          })
          .catch((error) => {
            console.error("Error updating withdrawal in database:", error)
            toast.error("Withdrawal recorded on blockchain but failed to update database")
          })
      }
    } else if (isWithdrawError) {
      setTransaction({ status: "idle", message: "" })
      toast.error("Withdrawal rejected")
    }
  }, [
    isWithdrawPending,
    isWithdrawLoading,
    isWithdrawSuccess,
    isWithdrawError,
    withdrawTxHash,
    address,
    amount,
    onOpenChange,
    onSuccess,
  ])

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (Number.parseFloat(amount) > Number.parseFloat(gameBalance)) {
      toast.error("Insufficient game balance")
      return
    }

    try {
      await withdrawFromGame(gameWrite, amount)
    } catch (error) {
      console.error("Error withdrawing tokens:", error)
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
            <DialogTitle className="text-xl font-bold">Withdraw 69USDC</DialogTitle>
            <DialogDescription className="text-gray-400">
              Withdraw 69USDC tokens from the dice game to your wallet.
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
            <div className="text-sm text-gray-400">Your Game Balance: {gameBalance} 69USDC</div>
          </div>

          <Button
            onClick={handleWithdraw}
            disabled={transaction.status !== "idle" || !isConnected || Number.parseFloat(amount) <= 0}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
          >
            Withdraw Tokens
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

