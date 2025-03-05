import { formatEther, parseEther } from "viem"
import { useReadContract, useWriteContract } from "wagmi"

// The deployed contract addresses
export const TOKEN_CONTRACT_ADDRESS = "0x7A5FfbcFB8Dc0DBdF0EaA701333e2Cf64908d547"
// Updated minter contract address
export const MINTER_CONTRACT_ADDRESS = "0x4a2a557Eee210ae934ee1A898C1bd1e3028B728F"

// ABI for the 69Usdc token
export const TOKEN_ABI = [
  // Read functions
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

// ABI for the 69Usdc minter
export const MINTER_ABI = [
  // Read functions
  {
    inputs: [],
    name: "RATE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenAmount", type: "uint256" }],
    name: "burn",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdrawEth",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawAllEth",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

// Hook to get token balance with refetch capability
export function use69UsdcBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    abi: TOKEN_ABI,
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      // Refresh more frequently to catch balance updates
      refetchInterval: 3000,
    },
  })
}

// Hook for writing to token contract
export function use69UsdcWrite() {
  return useWriteContract()
}

// Hook for minting tokens
export function useMint69Usdc() {
  return useWriteContract()
}

// Hook for burning tokens
export function useBurn69Usdc() {
  return useWriteContract()
}

// Helper function to format token balance
export function formatTokenBalance(balance: bigint | undefined): string {
  if (!balance) return "0.00"
  return formatEther(balance)
}

// Helper function to transfer tokens
export function transferTokens(
  writeContract: ReturnType<typeof use69UsdcWrite>["writeContract"],
  to: `0x${string}`,
  amount: string,
) {
  if (!writeContract) return

  return writeContract({
    abi: TOKEN_ABI,
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "transfer",
    args: [to, parseEther(amount)],
  })
}

// Helper function to approve tokens
export function approveTokens(
  writeContract: ReturnType<typeof use69UsdcWrite>["writeContract"],
  spender: `0x${string}`,
  amount: string,
) {
  if (!writeContract) return

  return writeContract({
    abi: TOKEN_ABI,
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "approve",
    args: [spender, parseEther(amount)],
  })
}

// Helper function to mint tokens with ETH
export function mintTokens(writeContract: ReturnType<typeof useMint69Usdc>["writeContract"], ethAmount: string) {
  if (!writeContract) return

  return writeContract({
    abi: MINTER_ABI,
    address: MINTER_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "mint",
    value: parseEther(ethAmount),
  })
}

// Helper function to burn tokens
export function burnTokens(writeContract: ReturnType<typeof useBurn69Usdc>["writeContract"], tokenAmount: string) {
  if (!writeContract) return

  return writeContract({
    abi: MINTER_ABI,
    address: MINTER_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "burn",
    args: [parseEther(tokenAmount)],
  })
}

// Helper function to approve minter contract
export function approveMinter(writeContract: ReturnType<typeof use69UsdcWrite>["writeContract"], amount: string) {
  if (!writeContract) return

  return writeContract({
    abi: TOKEN_ABI,
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    functionName: "approve",
    args: [MINTER_CONTRACT_ADDRESS as `0x${string}`, parseEther(amount)],
  })
}

// Calculate token amount from ETH amount (0.0005 ETH = 1 69USDC)
export function calculateTokenAmount(ethAmount: string): string {
  if (!ethAmount || isNaN(Number(ethAmount))) return "0"

  const eth = Number.parseFloat(ethAmount)
  const tokens = eth / 0.0005
  return tokens.toString()
}

// Calculate ETH amount from token amount (1 69USDC = 0.0005 ETH)
export function calculateEthAmount(tokenAmount: string): string {
  if (!tokenAmount || isNaN(Number(tokenAmount))) return "0"

  const tokens = Number.parseFloat(tokenAmount)
  const eth = tokens * 0.0005
  return eth.toFixed(6)
}

