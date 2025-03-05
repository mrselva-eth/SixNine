"use client"

import { useEffect, useState } from "react"
import { getCurrentRpcUrl, switchToNextRpcUrl } from "@/utils/rpc-fallback"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function RpcStatusMonitor() {
  const [currentRpcUrl, setCurrentRpcUrl] = useState<string>("")

  useEffect(() => {
    // Get the current RPC URL on mount
    setCurrentRpcUrl(getCurrentRpcUrl())

    // Set up a global error handler for RPC errors
    const originalOnError = window.onerror

    window.onerror = (message, source, lineno, colno, error) => {
      // Check if the error is related to RPC
      if (
        message.toString().includes("rate limit") ||
        message.toString().includes("exceeded") ||
        message.toString().includes("too many requests")
      ) {
        // Switch to the next RPC URL
        const newUrl = switchToNextRpcUrl()
        setCurrentRpcUrl(newUrl)

        // Reload the page to apply the new RPC URL
        window.location.reload()

        return true // Prevent default error handling
      }

      // Call the original error handler
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error)
      }

      return false
    }

    // Clean up
    return () => {
      window.onerror = originalOnError
    }
  }, [])

  const handleManualSwitch = () => {
    const newUrl = switchToNextRpcUrl()
    setCurrentRpcUrl(newUrl)

    // Reload the page to apply the new RPC URL
    window.location.reload()
  }

  // Don't render anything if we don't have an RPC URL
  if (!currentRpcUrl) return null

  // Extract the key part from the URL for display
  const displayUrl = currentRpcUrl.includes("infura.io/v3/")
    ? `...${currentRpcUrl.split("infura.io/v3/")[1].substring(0, 6)}`
    : currentRpcUrl

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        variant="outline"
        size="sm"
        className="bg-gray-900/80 text-xs text-gray-400 hover:text-white"
        onClick={handleManualSwitch}
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        RPC: {displayUrl}
      </Button>
    </div>
  )
}

