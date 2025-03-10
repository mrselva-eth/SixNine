"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// System prompt that provides context about the project
const systemPrompt = `
You are 69 AI, the assistant for the SixNine(69) dice game platform. Answer questions specifically about the platform and its features.

About the platform:
- SixNine(69) is a provably fair dice game on the Sepolia Ethereum testnet
- Users can deposit and withdraw 69USDC tokens to play
- The game uses a provably fair system with server seeds and client seeds
- Players win on rolls of 4, 5, or 6, and lose on 1, 2, or 3
- The platform has features like game history, balance visualization, and a leaderboard
- Users can mint 69USDC tokens by exchanging ETH at a rate of 0.0005 ETH = 1 69USDC
- The platform tracks betting statistics and displays them in charts

Only answer questions related to the SixNine(69) platform. For unrelated questions, politely redirect the conversation back to the platform.
`

export async function chatWithAI(messages: { role: "user" | "assistant"; content: string }[]) {
  try {
    const response = await generateText({
      model: openai("gpt-4o"),
      prompt: messages.map((message) => message.content).join("\n"),
      system: systemPrompt,
    })

    return { success: true, text: response.text }
  } catch (error) {
    console.error("Error in chat action:", error)
    return {
      success: false,
      text: "Sorry, I encountered an error. Please try again later.",
    }
  }
}

