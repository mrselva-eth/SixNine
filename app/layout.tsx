"use client"

import type React from "react"
import "./globals.css"
import { Toaster } from "sonner"
import "@rainbow-me/rainbowkit/styles.css"
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { sepolia } from "wagmi/chains"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { SiteHeader } from "@/components/site-header"
import { MainSidebar } from "@/components/main-sidebar"
import { WalletConnectionOverlay } from "@/components/wallet-connection-overlay"
import { usePathname } from "next/navigation"
import { configureTransports } from "@/utils/rpc-provider"
// Add the RPC Status Monitor to the layout
import { RpcStatusMonitor } from "@/components/rpc-status-monitor"

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!

// Create a custom config with fallback RPC providers
const config = getDefaultConfig({
  appName: "SixNine(69)",
  projectId: projectId,
  chains: [sepolia],
  ssr: true,
  // Use our configured transports with fallback capability
  transports: configureTransports(),
})

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDiceGamePage = pathname === "/"

  return (
    <html lang="en" className={isDiceGamePage ? "hide-scrollbar" : ""}>
      <head>
        <link rel="preload" href="/fonts/Orbitron.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <title>SixNine(69)</title>
      </head>
      <body className="min-h-screen bg-black overflow-x-hidden">
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              {/* Add it inside the main div, just before the Toaster */}
              <div className={`relative flex min-h-screen flex-col ${isDiceGamePage ? "hide-scrollbar" : ""}`}>
                <SiteHeader />
                <MainSidebar />
                <main className={`flex-1 ml-[70px] lg:ml-[70px] ${isDiceGamePage ? "hide-scrollbar" : ""}`}>
                  {children}
                </main>
                <WalletConnectionOverlay />
                <RpcStatusMonitor />
              </div>
              <Toaster
                position="bottom-right"
                richColors
                closeButton
                theme="dark"
                expand
                visibleToasts={6}
                toastOptions={{
                  style: {
                    background: "#1a1f2e",
                    border: "1px solid #374151",
                    color: "white",
                  },
                }}
              />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}

