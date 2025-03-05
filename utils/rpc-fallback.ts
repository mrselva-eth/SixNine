import { toast } from "sonner"
import { getAllRpcUrls } from "./rpc-provider"

// Keep track of the current RPC URL index
let currentRpcUrlIndex = 0
const rpcUrls = getAllRpcUrls()

// Function to handle RPC errors and switch to the next provider
export const handleRpcError = (error: unknown) => {
  // Check if the error is related to rate limiting or RPC issues
  const errorMessage = error instanceof Error ? error.message : String(error)

  if (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("exceeded") ||
    errorMessage.includes("too many requests") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("connection refused") ||
    errorMessage.includes("network error")
  ) {
    // Try the next RPC URL
    currentRpcUrlIndex = (currentRpcUrlIndex + 1) % rpcUrls.length

    // Show a toast notification
    toast.info(`Switching to next RPC provider due to rate limiting (${currentRpcUrlIndex + 1}/${rpcUrls.length})`)

    // You could update localStorage or another state management solution here
    // to persist the current RPC URL index
    localStorage.setItem("currentRpcUrlIndex", currentRpcUrlIndex.toString())

    // Return the new RPC URL
    return rpcUrls[currentRpcUrlIndex]
  }

  // If it's not a rate limiting error, just rethrow
  throw error
}

// Function to get the current RPC URL
export const getCurrentRpcUrl = () => {
  // Try to get the current index from localStorage
  const savedIndex = localStorage.getItem("currentRpcUrlIndex")
  if (savedIndex !== null) {
    currentRpcUrlIndex = Number.parseInt(savedIndex, 10) % rpcUrls.length
  }

  return rpcUrls[currentRpcUrlIndex]
}

// Function to manually switch to the next RPC URL
export const switchToNextRpcUrl = () => {
  currentRpcUrlIndex = (currentRpcUrlIndex + 1) % rpcUrls.length
  localStorage.setItem("currentRpcUrlIndex", currentRpcUrlIndex.toString())

  toast.info(`Manually switched to RPC provider ${currentRpcUrlIndex + 1}/${rpcUrls.length}`)

  // Return the new URL
  return rpcUrls[currentRpcUrlIndex]
}

