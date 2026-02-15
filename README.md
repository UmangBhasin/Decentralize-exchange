# 🚀 Decentralize-Exchange  
### A Full-Stack Automated Market Maker (AMM) Based Decentralized Exchange

![Solidity](https://img.shields.io/badge/Solidity-0.8.x-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-Development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-black)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌍 Overview

**Decentralize-Exchange** is a full-stack decentralized exchange (DEX) built from scratch using Solidity smart contracts and a Next.js frontend.

The project replicates the core mechanics of AMM-based protocols like Uniswap, implementing:

- Liquidity pool creation  
- Token swaps using constant product formula  
- LP token minting  
- Modular smart contract architecture  
- Full-stack Web3 integration  

This project is developed as a collaborative blockchain engineering project.

---

## 🧠 AMM Logic (How Pricing Works)

This DEX uses the **Constant Product Formula**:

```
x * y = k
```

Where:

- `x` = Reserve of Token A  
- `y` = Reserve of Token B  
- `k` = Constant value  

When a user swaps tokens:
- The product remains constant  
- Price adjusts automatically  
- No order book is required  

This makes trading decentralized, permissionless, and algorithm-driven.

---

## 🏗️ System Architecture

```
User Wallet
     ↓
Frontend (Next.js + Ethers.js)
     ↓
DexRouter Contract
     ↓
DexPair Contract
     ↓
Liquidity Pool
```

---

## 📦 Smart Contracts

| Contract | Purpose |
|-----------|----------|
| DexFactory.sol | Creates trading pairs |
| DexPair.sol | Manages reserves & liquidity |
| DexRouter.sol | Handles swaps & liquidity operations |
| LPToken.sol | Represents liquidity ownership |
| MockERC20.sol | Testing tokens |

---

## ⚙️ Tech S

