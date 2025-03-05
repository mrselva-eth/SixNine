// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title 69Usdc Token
 * @dev ERC20 Token with minting capabilities
 * Includes standard ERC20 functions: transfer, approve, transferFrom, balanceOf, allowance
 */
contract SixNine is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    constructor(address initialOwner)
        ERC20("69Usdc", "69")
        Ownable(initialOwner)
        ERC20Permit("69Usdc")
    {
        // No initial supply - tokens will be minted as needed
    }

    /**
     * @dev Creates `amount` new tokens and assigns them to `to`.
     * Can only be called by the contract owner.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Returns the number of decimals used for token - standard 18 for ERC20
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    // The following standard ERC20 functions are inherited from OpenZeppelin's ERC20 implementation:
    // 
    // function transfer(address to, uint256 amount) public virtual returns (bool)
    // function approve(address spender, uint256 amount) public virtual returns (bool)
    // function transferFrom(address from, address to, uint256 amount) public virtual returns (bool)
    // function balanceOf(address account) public view virtual returns (uint256)
    // function allowance(address owner, address spender) public view virtual returns (uint256)
    // function totalSupply() public view virtual returns (uint256)
}

