"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bot, User, Send, Loader2, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { chatWithAI } from "@/app/actions/chat-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function AIPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm 69 AI, your assistant for the SixNine(69) dice game. How can I help you today?",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Get all messages for context
      const allMessages = [...messages, userMessage]

      // Call the server action
      const response = await chatWithAI(allMessages)

      if (response.success) {
        // Add AI response
        setMessages((prev) => [...prev, { role: "assistant", content: response.text }])
      } else {
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again later.",
          },
        ])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="sticky top-0 z-10 w-full bg-black/80 backdrop-blur-sm py-3 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-[#0affff] to-[#0affff]/60 bg-clip-text text-transparent">
          69 AI Assistant
        </h1>
      </div>

      {/* Chat container */}
      <div className="flex-1 flex flex-col relative pt-2">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.role === "user"
                      ? "bg-[#0affff] text-black rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                      : "bg-[#1a1f2e] text-white rounded-tr-xl rounded-bl-xl rounded-br-xl"
                  } p-3 shadow-md`}
                >
                  <div className="mr-2 mt-0.5">
                    {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex bg-[#1a1f2e] text-white rounded-tr-xl rounded-bl-xl rounded-br-xl p-3 shadow-md">
                  <div className="mr-2 mt-0.5">
                    <Bot className="h-5 w-5" />
                  </div>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed input area at bottom */}
        <div className="sticky bottom-0 w-full bg-black/80 backdrop-blur-sm py-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the SixNine(69) platform..."
                className="flex-1 bg-[#1a1f2e] border border-gray-700 rounded-l-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0affff]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#0affff] text-black p-3 rounded-r-md hover:bg-[#0affff]/80 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>

              {/* Info button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-[#1a1f2e] text-[#0affff] hover:bg-[#1a1f2e]/80 hover:text-[#0affff]/80"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1f2e] border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-[#0affff]">About 69 AI Assistant</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      <p className="mb-4">This AI assistant is specifically designed to:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Answer questions about the SixNine(69) platform</li>
                        <li>Help you understand game mechanics and features</li>
                        <li>Provide guidance on platform functionality</li>
                        <li>Assist with platform-related issues</li>
                      </ul>
                      <p className="mt-4">
                        For general questions not related to the platform, please use other AI assistants.
                      </p>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

