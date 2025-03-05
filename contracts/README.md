# 69Usdc Token Contract

This folder contains the Solidity smart contract for the 69Usdc token used in the Provably Fair Dice Game.

## Contract Details

- **Contract Name**: SixNine
- **Token Name**: 69Usdc
- **Symbol**: 69
- **Decimals**: 18
- **Max Supply**: Unlimited (mintable by owner)
- **Network**: Sepolia Ethereum Testnet

## Standard ERC20 Functions

The contract includes all standard ERC20 functions:

- `transfer(address to, uint256 amount)` - Transfer tokens to another address
- `approve(address spender, uint256 amount)` - Approve another address to spend tokens
- `transferFrom(address from, address to, uint256 amount)` - Transfer tokens from one address to another
- `balanceOf(address account)` - Get token balance of an address
- `allowance(address owner, address spender)` - Get approved spending amount
- `totalSupply()` - Get total token supply

## Additional Functions

- `mint(address to, uint256 amount)` - Create new tokens (only owner)
- `burn(uint256 amount)` - Destroy tokens
- `burnFrom(address account, uint256 amount)` - Destroy tokens from another account

## Deployment Instructions (Remix IDE)

1. Open [Remix IDE](https://remix.ethereum.org/)

2. Create a new file named `69Usdc.sol` and paste the contract code

3. Make sure you have the following OpenZeppelin dependencies:
   - @openzeppelin/contracts/token/ERC20/ERC20.sol
   - @openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol
   - @openzeppelin/contracts/access/Ownable.sol
   - @openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol

4. Compile the contract:
   - Select Solidity Compiler in the left sidebar
   - Choose compiler version 0.8.20 or higher
   - Click "Compile 69Usdc.sol"

5. Deploy the contract:
   - Select "Deploy & Run Transactions" in the left sidebar
   - Set the environment to "Injected Provider - MetaMask" (make sure MetaMask is connected to Sepolia)
   - Select the "SixNine" contract from the dropdown
   - Enter your wallet address as the `initialOwner` parameter
   - Click "Deploy"
   - Confirm the transaction in MetaMask

6. After deployment:
   - The contract will be listed under "Deployed Contracts"
   - You can interact with functions like `mint` to create new tokens
   - Use `mint(address to, uint256 amount)` to mint tokens to any address

## Minting Tokens

To mint tokens:
1. Expand the deployed contract in Remix
2. Find the `mint` function
3. Enter the recipient address and amount (in wei, e.g., 1000000000000000000 for 1 token)
4. Click "transact" and confirm in MetaMask

## Integration with Dice Game

To integrate this token with the dice game:
1. Save the deployed contract address
2. Update the frontend to interact with this token using ethers.js or wagmi
3. Implement the mint functionality in the wallet sidebar

