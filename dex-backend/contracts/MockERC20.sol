// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
========================================
            MockERC20 Token
========================================
This contract is used for testing the DEX.

Features:
- Standard ERC20 token
- Initial supply minted to deployer
- Manual mint function (for testing only)
========================================
*/

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {

    
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) {

        // Mint initial supply to deployer
        _mint(msg.sender, initialSupply);
    }

    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
