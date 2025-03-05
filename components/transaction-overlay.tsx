"use client"

import type React from "react"

import { useEffect } from "react"
import { createPortal } from "react-dom"

interface TransactionOverlayProps {
  message: string
}

export function TransactionOverlay({ message }: TransactionOverlayProps) {
  // Prevent scrolling when overlay is shown
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
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
      <div className="flex flex-col items-center justify-between h-full py-20">
        <div className="flex-1 flex items-center justify-center">{renderLoader()}</div>
        <div className="transaction-status text-2xl mt-8">{message}</div>
      </div>
    </div>,
    document.body,
  )
}

