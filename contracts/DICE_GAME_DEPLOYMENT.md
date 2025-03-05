# Dice Game Contract Deployment Guide

This guide explains how to deploy the Dice Game contract on the Sepolia testnet.

## Prerequisites

1. The 69USDC token contract is already deployed at: `0x7A5FfbcFB8Dc0DBdF0EaA701333e2Cf64908d547`
2. You have the owner address: `0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6`
3. You have some Sepolia ETH for deployment

## Deployment Steps (Remix IDE)

1. Open [Remix IDE](https://remix.ethereum.org/)

2. Create a new file named `DiceGame.sol` and paste the contract code

3. Make sure you have the following OpenZeppelin dependencies:
  - @openzeppelin/contracts/token/ERC20/IERC20.sol
  - @openzeppelin/contracts/access/Ownable.sol
  - @openzeppelin/contracts/utils/ReentrancyGuard.sol

4. Compile the contract:
  - Select Solidity Compiler in the left sidebar
  - Choose compiler version 0.8.20 or higher
  - Click "Compile DiceGame.sol"

5. Deploy the contract:
  - Select "Deploy & Run Transactions" in the left sidebar
  - Set the environment to "Injected Provider - MetaMask" (make sure MetaMask is connected to Sepolia)
  - Select the "DiceGame" contract from the dropdown
  - Enter the constructor parameters:
    - `_tokenAddress`: `0x7A5FfbcFB8Dc0DBdF0EaA701333e2Cf64908d547` (69USDC token address)
    - `_owner`: `0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6` (Your address)
  - Click "Deploy"
  - Confirm the transaction in MetaMask

6. After deployment:
  - Save the deployed dice game contract address
  - Update the `DICE_GAME_CONTRACT_ADDRESS` in `utils/game-contract.ts`
  - Send some ETH to the contract so it can handle transactions

## Funding the Contract

Before users can play the game, you need to fund the contract with ETH and 69USDC tokens:

1. Send some ETH to the contract address to cover gas costs
2. Use the 69USDC token contract to send tokens to the dice game contract:
   - Call the `transfer` function with:
     - `to`: The dice game contract address
     - `value`: The amount of tokens to send (in wei, e.g., 1000000000000000000 for 1 token)

## Setting Up MongoDB

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster and database named "dice-game"
3. Create a collection named "users"
4. Get your MongoDB connection string
5. Add the connection string to your .env.local file:

