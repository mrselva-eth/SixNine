"use client"

import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"
import { format } from "date-fns"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

interface StatsChartProps {
  title: string
  data: Array<{ count?: number; amount?: string; timestamp: Date }>
  type?: "line" | "bar"
  valueType?: "count" | "amount"
  color?: string
  height?: number
}

export function StatsChart({
  title,
  data,
  type = "line",
  valueType = "count",
  color = "#0affff",
  height = 250,
}: StatsChartProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    if (data.length === 0) return

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    // Format labels and prepare data points
    const labels = sortedData.map((point) => format(point.timestamp, "h:mm a"))
    const dataPoints = sortedData.map((point) =>
      valueType === "count" ? point.count || 0 : Number(point.amount || "0"),
    )

    // Create gradient
    const ctx = document.createElement("canvas").getContext("2d")
    let gradient

    if (ctx) {
      gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, `${color}80`) // 50% opacity
      gradient.addColorStop(1, `${color}00`) // 0% opacity
    }

    setChartData({
      labels,
      datasets: [
        {
          label: title,
          data: dataPoints,
          borderColor: color,
          backgroundColor: type === "line" ? gradient : `${color}80`,
          tension: 0.4,
          fill: type === "line",
          pointRadius: type === "line" ? 3 : 0,
          pointBackgroundColor: color,
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    })
  }, [data, title, type, valueType, color, height])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#9ca3af",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#9ca3af",
          callback: (value: string | number) => (valueType === "amount" ? `${value} 69USDC` : value),
          beginAtZero: true,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#e5e7eb",
        bodyColor: "#e5e7eb",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) =>
            valueType === "amount" ? `${title}: ${context.raw} 69USDC` : `${title}: ${context.raw}`,
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  }

  return (
    <div className="h-full w-full">
      {type === "line" ? (
        <Line data={chartData} options={options} height={height} />
      ) : (
        <Bar data={chartData} options={options} height={height} />
      )}
    </div>
  )
}

