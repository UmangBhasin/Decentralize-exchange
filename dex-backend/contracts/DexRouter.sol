// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
========================================
                DEX ROUTER
========================================
Responsible for:
- Adding liquidity
- Connecting user → pair
========================================
*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DexFactory.sol";
import "./DexPair.sol";

contract DexRouter {

    address public factory;

    constructor(address _factory) {
        factory = _factory;
    }

    /*
    ========================================
            ADD LIQUIDITY FUNCTION
    ========================================
    Transfers tokens from user to pair
    and mints LP tokens.
    ========================================
    */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountA,
        uint amountB
    ) external {

        // Get pair from factory
        address pair = DexFactory(factory).getPair(tokenA, tokenB);

        // If pair does not exist, create it
        if (pair == address(0)) {
            pair = DexFactory(factory).createPair(tokenA, tokenB);
        }

        // Transfer tokens FROM USER to pair
        IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountB);

        // Mint LP tokens to user
        DexPair(pair).mint(msg.sender);
    }
}
