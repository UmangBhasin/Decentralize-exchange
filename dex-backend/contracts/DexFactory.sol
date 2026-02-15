// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DexPair.sol";

contract DexFactory {

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair);

    function createPair(address tokenA, address tokenB) external returns (address pair) {

        require(tokenA != tokenB, "Identical addresses");

        require(getPair[tokenA][tokenB] == address(0), "Pair already exists");

        DexPair newPair = new DexPair(tokenA, tokenB);

        pair = address(newPair);

        getPair[tokenA][tokenB] = pair;
        getPair[tokenB][tokenA] = pair;

        allPairs.push(pair);

        emit PairCreated(tokenA, tokenB, pair);
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }
}
