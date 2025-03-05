"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gamepad2, History, BarChart3, Trophy, Bot, ChevronRight, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SidebarItem {
  title: string
  icon: React.ElementType
  href: string
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Game",
    icon: Gamepad2,
    href: "/game",
  },
  {
    title: "Game History",
    icon: History,
    href: "/history",
  },
  {
    title: "Visualization",
    icon: BarChart3,
    href: "/visualization",
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    href: "/leaderboard",
  },
  {
    title: "69 AI",
    icon: Bot,
    href: "/ai",
  },
]

export function MainSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  // Auto-collapse sidebar after navigation on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsExpanded(false)
    }
  }, [])

  return (
    <motion.div
      className="fixed left-0 top-20 h-[calc(100vh-5rem)] z-40 flex"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      animate={{ width: isExpanded ? "240px" : "70px" }}
      transition={{ duration: 0.3 }}
    >
      {/* Sidebar Background */}
      <div className="h-full w-full bg-gray-900/95 backdrop-blur-sm border-r border-gray-800">
        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Navigation Items */}
          <nav className="flex-1 p-3">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group relative overflow-hidden",
                        isActive ? "text-black bg-[#0affff]" : "text-gray-400 hover:text-white hover:bg-gray-800",
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -20 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap"
                      >
                        {item.title}
                      </motion.span>
                      {!isExpanded && (
                        <div
                          className={cn(
                            "absolute left-0 top-0 h-full w-1 bg-[#0affff] opacity-0 transition-opacity duration-200",
                            isActive && "opacity-100",
                          )}
                        />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Expand/Collapse Button */}
          <div className="p-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm">Collapse</span>
                </>
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

