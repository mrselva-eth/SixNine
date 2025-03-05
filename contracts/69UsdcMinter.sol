// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title 69Usdc Minter
 * @dev Contract for minting and burning 69Usdc tokens in exchange for ETH
 */
contract SixNineMinter is Ownable, ReentrancyGuard {
    // Token contract address
    IERC20 public token;
    
    // Buy/Sell rate: 0.0005 ETH = 1 69Usdc
    uint256 public constant RATE = 0.0005 ether;
    
    // Events
    event TokensMinted(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event TokensBurned(address indexed seller, uint256 tokenAmount, uint256 ethAmount);
    event EthWithdrawn(address indexed owner, uint256 amount);

    /**
     * @dev Constructor sets the token address and owner
     * @param _tokenAddress Address of the 69Usdc token contract
     * @param _owner Address of the contract owner who can withdraw ETH
     */
    constructor(address _tokenAddress, address _owner) Ownable(_owner) {
        token = IERC20(_tokenAddress);
    }

    /**
     * @dev Mint tokens by sending ETH
     * @return Amount of tokens minted
     */
    function mint() external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Must send ETH to mint tokens");
        
        // Calculate tokens to mint: ETH amount / RATE
        uint256 tokenAmount = (msg.value * 1 ether) / RATE;
        
        // Ensure the token contract has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount, "Not enough tokens in the contract");
        
        // Transfer tokens to the buyer
        bool success = token.transfer(msg.sender, tokenAmount);
        require(success, "Token transfer failed");
        
        emit TokensMinted(msg.sender, msg.value, tokenAmount);
        
        return tokenAmount;
    }

    /**
     * @dev Burn tokens to receive ETH
     * @param tokenAmount Amount of tokens to burn
     * @return Amount of ETH received
     */
    function burn(uint256 tokenAmount) external nonReentrant returns (uint256) {
        require(tokenAmount > 0, "Must burn some tokens");
        
        // Calculate ETH to return: token amount * RATE
        uint256 ethAmount = (tokenAmount * RATE) / 1 ether;
        
        // Ensure the contract has enough ETH
        require(address(this).balance >= ethAmount, "Not enough ETH in the contract");
        
        // Transfer tokens from the seller
        bool success = token.transferFrom(msg.sender, address(this), tokenAmount);
        require(success, "Token transfer failed");
        
        // Transfer ETH to the seller
        (bool sent, ) = payable(msg.sender).call{value: ethAmount}("");
        require(sent, "ETH transfer failed");
        
        emit TokensBurned(msg.sender, tokenAmount, ethAmount);
        
        return ethAmount;
    }
    
    /**
     * @dev Withdraw ETH from the contract (only owner)
     * @param amount Amount of ETH to withdraw
     */
    function withdrawEth(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Not enough ETH in the contract");
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit EthWithdrawn(owner(), amount);
    }
    
    /**
     * @dev Withdraw all ETH from the contract (only owner)
     */
    function withdrawAllEth() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH in the contract");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "ETH transfer failed");
        
        emit EthWithdrawn(owner(), balance);
    }
    
    /**
     * @dev Set a new token address (only owner)
     * @param _tokenAddress New token address
     */
    function setTokenAddress(address _tokenAddress) external onlyOwner {
        token = IERC20(_tokenAddress);
    }
    
    /**
     * @dev Withdraw any ERC20 tokens from the contract (only owner)
     * @param _tokenAddress Address of the token to withdraw
     * @param _amount Amount of tokens to withdraw
     */
    function withdrawERC20(address _tokenAddress, uint256 _amount) external onlyOwner {
        IERC20 tokenToWithdraw = IERC20(_tokenAddress);
        require(tokenToWithdraw.balanceOf(address(this)) >= _amount, "Not enough tokens in the contract");
        
        bool success = tokenToWithdraw.transfer(owner(), _amount);
        require(success, "Token transfer failed");
    }
}

