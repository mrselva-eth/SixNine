"use client"

import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { format } from "date-fns"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface BalanceChartProps {
  data: Array<{
    balance: string
    timestamp: Date
  }>
}

export function BalanceChart({ data }: BalanceChartProps) {
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
    const dataPoints = sortedData.map((point) => Number(point.balance))

    // Determine if overall trend is positive
    const isPositive = dataPoints.length >= 2 && dataPoints[dataPoints.length - 1] >= dataPoints[0]

    // Create gradient
    const ctx = document.createElement("canvas").getContext("2d")
    let gradient

    if (ctx) {
      gradient = ctx.createLinearGradient(0, 0, 0, 400)
      if (isPositive) {
        gradient.addColorStop(0, "rgba(10, 255, 255, 0.5)")
        gradient.addColorStop(1, "rgba(10, 255, 255, 0)")
      } else {
        gradient.addColorStop(0, "rgba(255, 99, 132, 0.5)")
        gradient.addColorStop(1, "rgba(255, 99, 132, 0)")
      }
    }

    setChartData({
      labels,
      datasets: [
        {
          label: "Balance",
          data: dataPoints,
          borderColor: isPositive ? "#0affff" : "#ff6384",
          backgroundColor: gradient || (isPositive ? "rgba(10, 255, 255, 0.5)" : "rgba(255, 99, 132, 0.5)"),
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: isPositive ? "#0affff" : "#ff6384",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    })
  }, [data])

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
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#9ca3af",
          callback: (tickValue: string | number) => `${tickValue} 69USDC`,
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
          label: (context: any) => `Balance: ${context.raw} 69USDC`,
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  }

  return <Line data={chartData} options={options} />
}

