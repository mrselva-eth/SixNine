# SixNine(69) - Provably Fair Dice Game

A blockchain-based dice game running on the Sepolia Ethereum testnet with provably fair mechanics, multiple betting options, and comprehensive statistics tracking.

## Interface 

![image](https://github.com/user-attachments/assets/d3c895e0-76de-4490-b578-a0d7c28df774)


## Deployed Link : https://sixninedice.netlify.app/


## Overview

SixNine(69) is a provably fair dice game built on the Ethereum blockchain (Sepolia testnet). Players can bet 69USDC tokens on dice rolls with various betting options and verify the fairness of each roll through cryptographic proofs. The platform includes features like game history, balance visualization, leaderboards, and an AI assistant.

## Features

- **Multiple Bet Types**: Classic (4-6), Specific Number, Odd/Even, and Range betting options
- **Provably Fair System**: Verify every roll with cryptographic hashes and client seeds
- **69USDC Token**: Mint and exchange tokens for ETH at a rate of 0.0005 ETH = 1 69USDC
- **Detailed Statistics**: Track your performance with comprehensive visualizations
- **Leaderboard**: Compete with other players based on balance, wins, and other metrics
- **Game History**: View your complete betting history with verification details
- **AI Assistant**: Get help and information about the platform from the 69 AI assistant
- **Responsive Design**: Fully responsive UI that works on desktop and mobile devices

## Technologies Used

- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **Blockchain**: Ethereum (Sepolia testnet), Wagmi, RainbowKit
- **Smart Contracts**: Solidity, OpenZeppelin
- **Database**: MongoDB
- **AI**: AI SDK with OpenAI integration
- **Charts**: Chart.js
- **Animation**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or another Ethereum wallet
- Sepolia testnet ETH (available from faucets)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/sixnine-dice-game.git
cd sixnine-dice-game
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file with the following variables:

```plaintext
# Wallet Connect Project ID
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# Primary Infura RPC URL
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_primary_infura_key

# Secondary Infura RPC URL (Fallback)
NEXT_PUBLIC_SEPOLIA_RPC_URL_2=https://sepolia.infura.io/v3/your_secondary_infura_key
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. **Connect Wallet**: Connect your MetaMask or other Ethereum wallet to the Sepolia testnet.
2. **Get 69USDC Tokens**: Mint 69USDC tokens by exchanging Sepolia ETH at a rate of 0.0005 ETH = 1 69USDC.
3. **Deposit Tokens**: Deposit 69USDC tokens to your game balance.
4. **Place Your Bet**:
   - Choose a bet type (Classic, Specific Number, Odd/Even, or Range)
   - Set your bet amount
   - Roll the dice
5. **Win or Lose**:
   - Classic: Win on rolls of 4, 5, or 6 (2x multiplier)
   - Specific Number: Win when your chosen number is rolled (6x multiplier)
   - Odd/Even: Win when the roll matches your odd/even choice (2x multiplier)
   - Range: Win when the roll falls within your chosen range (3x multiplier)
6. **Verify Fairness**: Check the provably fair system details to verify the roll was fair.
7. **Track Stats**: View your game history, statistics, and position on the leaderboard.

## Provably Fair System

SixNine(69) uses a provably fair system to ensure complete transparency:

1. The server generates a random seed and sends you its SHA-256 hash before you play.
2. You can provide your own client seed or use our randomly generated one.
3. After each roll, the server reveals the original seed used to generate the result.
4. You can verify that the hash of the revealed seed matches the hash you received before playing.
5. The roll result is calculated using: HMAC-SHA256(serverSeed, clientSeed + nonce) mod 6 + 1

## Smart Contracts

The project uses three main smart contracts:

1. **69Usdc Token (SixNine)**: ERC20 token used for betting
   - Contract Address: `0x7A5FfbcFB8Dc0DBdF0EaA701333e2Cf64908d547`

2. **69Usdc Minter (SixNineMinter)**: Contract for minting and exchanging tokens
   - Contract Address: `0x4a2a557Eee210ae934ee1A898C1bd1e3028B728F`

3. **Dice Game**: Main game contract for deposits, withdrawals, and bets
   - Contract Address: `0x5d69e1E14defd69FD617a3F07d739Cae099F4209`

All contracts are deployed on the Sepolia Ethereum testnet.

## Project Structure

```plaintext
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes for game logic
│   ├── game/             # Dice game page
│   ├── history/          # Game history page
│   ├── leaderboard/      # Leaderboard page
│   ├── visualization/    # Stats visualization page
│   └── ai/               # AI assistant page
├── components/           # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── dice-game.tsx     # Main game component
│   ├── wallet-sidebar.tsx # Wallet management sidebar
│   └── ...               # Other components
├── contracts/            # Smart contract files
│   ├── 69Usdc.sol        # ERC20 token contract
│   ├── 69UsdcMinter.sol  # Token minter contract
│   └── DiceGame.sol      # Main game contract
├── lib/                  # Library code
│   ├── db-utils.ts       # MongoDB utility functions
│   └── utils.ts          # General utility functions
├── utils/                # Utility functions
│   ├── game-contract.ts  # Game contract interactions
│   ├── token-contract.ts # Token contract interactions
│   └── rpc-provider.ts   # RPC provider configuration
└── public/               # Static assets
```

## Development

### MongoDB Setup

1. Create a MongoDB Atlas account
2. Create a new cluster and database named "dice-game"
3. Create collections: "users"
4. Get your MongoDB connection string
5. Add the connection string to your .env.local file

### Smart Contract Deployment

The smart contracts are already deployed on the Sepolia testnet. If you want to deploy your own versions:

1. Use Remix IDE or Hardhat to deploy the contracts
2. Update the contract addresses in `utils/token-contract.ts` and `utils/game-contract.ts`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

SixNine(69) operates exclusively on the Sepolia Ethereum testnet. The platform uses test tokens with no real-world value. This is a demonstration project and not intended for real gambling.

## Acknowledgements
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Wagmi](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [OpenZeppelin](https://openzeppelin.com/)
- [MongoDB](https://www.mongodb.com/)
- [Chart.js](https://www.chartjs.org/)
- [Framer Motion](https://www.framer.com/motion/)

## Please make sure to add the following environment variables to your project:

1) MONGODB_URI 
2) NEXT_PUBLIC_SEPOLIA_RPC_URL 
3) NEXT_PUBLIC_SEPOLIA_RPC_URL_2 
4) NEXT_PUBLIC_SEPOLIA_RPC_URL_3 
5) NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

## License

This project is licensed under the MIT License.

## Contact

If you have any questions or feedback, feel free to reach out:

Linkedin : https://www.linkedin.com/in/mrselvadoteth/

Discord: mrselva.eth

## Acknowledgements

Special thanks to the Web3 community and everyone who contributed to the development of SixNine(69).

