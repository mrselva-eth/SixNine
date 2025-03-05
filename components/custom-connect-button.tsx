"use client"

import { useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { WalletSidebar } from "./wallet-sidebar"

export function CustomConnectButton() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <div className="container" style={{ width: "auto", margin: 0 }}>
        <div className="btn" style={{ width: "160px", height: "40px", margin: 0 }}>
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== "loading"
              const connected =
                ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated")

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <a onClick={openConnectModal} style={{ cursor: "pointer", fontSize: "14px" }}>
                          Connect Wallet
                        </a>
                      )
                    }

                    if (chain.unsupported) {
                      return (
                        <a onClick={openChainModal} style={{ cursor: "pointer", fontSize: "14px" }}>
                          Wrong network
                        </a>
                      )
                    }

                    return (
                      <a onClick={() => setIsSidebarOpen(true)} style={{ cursor: "pointer", fontSize: "14px" }}>
                        {account.displayName}
                      </a>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>

      <WalletSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  )
}

