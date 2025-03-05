"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, DiscIcon as Discord, Mail, Shield, AlertTriangle } from "lucide-react"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0d1117] border-t border-gray-800 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: About */}
          <div>
            <h3 className="text-[#0affff] font-bold text-lg mb-4">About SixNine(69)</h3>
            <p className="text-gray-400 mb-4">
              A provably fair dice game running on the Sepolia Ethereum testnet. Experience the thrill of blockchain
              gaming with complete transparency.
            </p>
            <div className="flex items-center">
              <div className="border border-[#0affff] rounded p-1 h-12 flex items-center mr-3">
                <Image src="/logo.png" alt="SixNine(69) Logo" width={100} height={30} className="object-contain" />
              </div>
              <span className="text-white font-bold">SixNine(69)</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-[#0affff] font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/game" className="text-gray-400 hover:text-[#0affff] transition-colors">
                  Play Game
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-gray-400 hover:text-[#0affff] transition-colors">
                  Game History
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-400 hover:text-[#0affff] transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/visualization" className="text-gray-400 hover:text-[#0affff] transition-colors">
                  Statistics
                </Link>
              </li>
              <li>
                <Link href="/ai" className="text-gray-400 hover:text-[#0affff] transition-colors">
                  69 AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-[#0affff] font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#0affff] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#0affff] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#0affff] transition-colors">
                  Responsible Gaming
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#0affff] transition-colors">
                  Fair Play Policy
                </Link>
              </li>
              <li>
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Testnet Only</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h3 className="text-[#0affff] font-bold text-lg mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#0affff]/20 hover:text-[#0affff] transition-all"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#0affff]/20 hover:text-[#0affff] transition-all"
                aria-label="Discord"
              >
                <Discord className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#0affff]/20 hover:text-[#0affff] transition-all"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@sixnine69.com"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#0affff]/20 hover:text-[#0affff] transition-all"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-[#0affff]" />
                <span className="text-white font-semibold">Provably Fair</span>
              </div>
              <p className="text-gray-400 text-sm">
                Our dice game uses cryptographic verification to ensure complete transparency and fairness in every
                roll.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 text-sm text-yellow-200">
            <p className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Testnet Only:</strong> SixNine(69) operates exclusively on the Sepolia Ethereum testnet. The
                platform uses test tokens with no real-world value. This is a demonstration project and not intended for
                real gambling.
              </span>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} SixNine(69). All rights reserved. Built with Next.js and Ethereum.
          </p>
        </div>
      </div>
    </footer>
  )
}

