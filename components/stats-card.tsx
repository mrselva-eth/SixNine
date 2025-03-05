import type React from "react"
import { ArrowUp, ArrowDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  percentChange?: number
  icon?: React.ReactNode
  className?: string
}

export function StatsCard({ title, value, percentChange, icon, className }: StatsCardProps) {
  // Format percentage change
  const formattedPercent = percentChange !== undefined ? `${Math.abs(percentChange).toFixed(2)}%` : undefined

  // Determine if change is positive, negative, or neutral
  const changeType =
    percentChange === undefined
      ? "neutral"
      : percentChange > 0
        ? "positive"
        : percentChange < 0
          ? "negative"
          : "neutral"

  return (
    <div className={`bg-[#1a1f2e] rounded-xl p-4 shadow-lg border border-gray-800 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
          <div className="text-xl font-bold">{value}</div>
        </div>
        {icon && <div className="p-2 rounded-lg bg-[#0d1117]">{icon}</div>}
      </div>

      {percentChange !== undefined && (
        <div className="mt-2">
          <div
            className={`flex items-center text-xs font-medium ${
              changeType === "positive"
                ? "text-green-400"
                : changeType === "negative"
                  ? "text-red-400"
                  : "text-gray-400"
            }`}
          >
            {changeType === "positive" ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : changeType === "negative" ? (
              <ArrowDown className="h-3 w-3 mr-1" />
            ) : null}
            <span>{formattedPercent} from previous period</span>
          </div>
        </div>
      )}
    </div>
  )
}

