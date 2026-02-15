// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/*
========================================
            DEX PAIR (AMM POOL)
========================================
Handles:
- Storing reserves
- Minting LP tokens
========================================
*/

contract DexPair is ERC20 {

    address public token0;
    address public token1;

    uint112 private reserve0;
    uint112 private reserve1;

    constructor(address _token0, address _token1)
        ERC20("LP Token", "LPT")
    {
        token0 = _token0;
        token1 = _token1;
    }

    /*
    ========================================
                GET RESERVES
    ========================================
    */
    function getReserves()
        external
        view
        returns (uint112, uint112)
    {
        return (reserve0, reserve1);
    }

    /*
    ========================================
                MINT LP TOKENS
    ========================================
    Called by Router after tokens transferred
    */
    function mint(address to) external returns (uint liquidity) {

        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));

        uint amount0 = balance0 - reserve0;
        uint amount1 = balance1 - reserve1;

        liquidity = sqrt(amount0 * amount1);

        require(liquidity > 0, "Insufficient liquidity minted");

        _mint(to, liquidity);

        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
    }

    /*
    ========================================
                SQRT FUNCTION
    ========================================
    */
    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
