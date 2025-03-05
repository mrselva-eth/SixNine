"use client"

import type React from "react"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

interface TransactionOverlayProps {
  message: string
  status?: "pending" | "approving" | "success" | "error" | "idle"
  onClose?: () => void
}

export function TransactionOverlay({ message, status = "pending", onClose }: TransactionOverlayProps) {
  // Prevent scrolling when overlay is shown
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  // Add a safety timeout to hide the overlay after 2 minutes
  // This prevents the overlay from getting stuck indefinitely
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      // Force remove the overlay after 2 minutes
      const overlayElement = document.querySelector(".transaction-overlay")
      if (overlayElement && overlayElement.parentNode) {
        overlayElement.parentNode.removeChild(overlayElement)
        document.body.style.overflow = "auto"
      }
    }, 120000) // 2 minutes

    return () => clearTimeout(safetyTimeout)
  }, [])

  // Create the new square animation loader
  const renderLoader = () => (
    <div className="container">
      <div className="square">
        <span style={{ "--i": 0 } as React.CSSProperties}></span>
        <span style={{ "--i": 1 } as React.CSSProperties}></span>
        <span style={{ "--i": 2 } as React.CSSProperties}></span>
        <span style={{ "--i": 3 } as React.CSSProperties}></span>
      </div>
      <div className="square">
        <span style={{ "--i": 0 } as React.CSSProperties}></span>
        <span style={{ "--i": 1 } as React.CSSProperties}></span>
        <span style={{ "--i": 2 } as React.CSSProperties}></span>
        <span style={{ "--i": 3 } as React.CSSProperties}></span>
      </div>
      <div className="square">
        <span style={{ "--i": 0 } as React.CSSProperties}></span>
        <span style={{ "--i": 1 } as React.CSSProperties}></span>
        <span style={{ "--i": 2 } as React.CSSProperties}></span>
        <span style={{ "--i": 3 } as React.CSSProperties}></span>
      </div>
    </div>
  )

  // Use portal to render at the document body level
  return createPortal(
    <div className="transaction-overlay">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-[#1a1f2e] text-gray-400 hover:text-white hover:bg-[#0d1117] transition-colors z-50"
          aria-label="Close transaction overlay"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="flex flex-col items-center justify-between h-full py-20">
        <div className="flex-1 flex items-center justify-center">{renderLoader()}</div>
        <div className="transaction-status text-2xl mt-8">{message}</div>
      </div>
    </div>,
    document.body,
  )
}

