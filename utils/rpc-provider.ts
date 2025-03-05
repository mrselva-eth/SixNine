import { http } from "wagmi"
import { sepolia } from "wagmi/chains"

// Array of RPC URLs using environment variables
const getRpcUrls = (): string[] => {
  const urls: string[] = []

  // Add primary RPC URL
  if (process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL) {
    urls.push(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL)
  }

  // Add secondary RPC URLs
  if (process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL_2) {
    urls.push(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL_2)
  }

  if (process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL_3) {
    urls.push(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL_3)
  }

  // If no custom URLs are provided, use a default Infura URL with the project ID
  if (urls.length === 0 && process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
    urls.push(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID}`)
  }

  return urls
}

// Create a fallback transport using the first available RPC URL
// If it fails, we'll handle fallback at the application level
export const createTransport = () => {
  const urls = getRpcUrls()

  // Use the first URL as the primary
  if (urls.length > 0) {
    return http(urls[0])
  }

  // Fallback to a default if no URLs are available
  return http("https://rpc.sepolia.org")
}

// Export a transports object for wagmi configuration
export const configureTransports = () => {
  return {
    [sepolia.id]: createTransport(),
  }
}

// Function to get the next RPC URL when one fails
export const getNextRpcUrl = (currentUrl: string): string | null => {
  const urls = getRpcUrls()
  const currentIndex = urls.indexOf(currentUrl)

  // If current URL is not found or it's the last one, return the first URL
  if (currentIndex === -1 || currentIndex === urls.length - 1) {
    return urls[0] || null
  }

  // Otherwise, return the next URL
  return urls[currentIndex + 1]
}

// All available RPC URLs for manual fallback
export const getAllRpcUrls = () => getRpcUrls()

