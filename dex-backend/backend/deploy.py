"""
========================================
        PYTHON DEX DEPLOY SCRIPT
========================================
This script:
1. Connects to Hardhat blockchain
2. Deploys TokenA & TokenB
3. Deploys Factory & Router
4. Mints extra tokens (balance fix)
5. Creates Pair
6. Approves tokens
7. Adds Liquidity
8. Prints reserves
========================================
"""

# ========================================
# SECTION 1 — IMPORTS & CONNECTION
# ========================================

from web3 import Web3
import json

print("\n=== Connecting to Blockchain ===")

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

if not w3.is_connected():
    raise Exception("Web3 not connected")

print("Connected Successfully")

private_key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
account = w3.eth.account.from_key(private_key)

print("Using account:", account.address)

nonce = w3.eth.get_transaction_count(account.address)


# ========================================
# SECTION 2 — GENERIC DEPLOY FUNCTION
# ========================================

def deploy_contract(contract_path, constructor_args=[]):
    global nonce

    with open(contract_path) as f:
        contract_json = json.load(f)

    abi = contract_json["abi"]
    bytecode = contract_json["bytecode"]

    contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    tx = contract.constructor(*constructor_args).build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gas": 8000000,
        "gasPrice": w3.to_wei("20", "gwei")
    })

    signed_tx = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    nonce += 1

    return receipt.contractAddress


# ========================================
# SECTION 3 — DEPLOY CORE CONTRACTS
# ========================================

print("\n=== Deploying Core Contracts ===")

tokenA_address = deploy_contract(
    "../artifacts/contracts/MockERC20.sol/MockERC20.json",
    ["TokenA", "TKA", w3.to_wei(1000000, "ether")]
)
print("TokenA deployed at:", tokenA_address)

tokenB_address = deploy_contract(
    "../artifacts/contracts/MockERC20.sol/MockERC20.json",
    ["TokenB", "TKB", w3.to_wei(1000000, "ether")]
)
print("TokenB deployed at:", tokenB_address)

factory_address = deploy_contract(
    "../artifacts/contracts/DexFactory.sol/DexFactory.json"
)
print("Factory deployed at:", factory_address)

router_address = deploy_contract(
    "../artifacts/contracts/DexRouter.sol/DexRouter.json",
    [factory_address]
)
print("Router deployed at:", router_address)


# ========================================
# SECTION 4 — LOAD CONTRACT INSTANCES
# ========================================

print("\n=== Loading Contract Instances ===")

with open("../artifacts/contracts/MockERC20.sol/MockERC20.json") as f:
    erc20_json = json.load(f)

with open("../artifacts/contracts/DexFactory.sol/DexFactory.json") as f:
    factory_json = json.load(f)

with open("../artifacts/contracts/DexRouter.sol/DexRouter.json") as f:
    router_json = json.load(f)

with open("../artifacts/contracts/DexPair.sol/DexPair.json") as f:
    pair_json = json.load(f)

tokenA = w3.eth.contract(address=tokenA_address, abi=erc20_json["abi"])
tokenB = w3.eth.contract(address=tokenB_address, abi=erc20_json["abi"])
factory = w3.eth.contract(address=factory_address, abi=factory_json["abi"])
router = w3.eth.contract(address=router_address, abi=router_json["abi"])


# ========================================
# SECTION 5 — MANUAL MINT (BALANCE FIX)
# ========================================

print("\n=== Minting Tokens to Account ===")

mint_amount = w3.to_wei(2000, "ether")

for token in [tokenA, tokenB]:
    tx = token.functions.mint(account.address, mint_amount).build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gas": 500000,
        "gasPrice": w3.to_wei("20", "gwei")
    })

    signed_tx = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    w3.eth.wait_for_transaction_receipt(tx_hash)

    nonce += 1

print("Minting completed")


# ========================================
# SECTION 6 — VERIFY TOKEN BALANCES
# ========================================

print("\n=== Checking Initial Balances ===")

balanceA = tokenA.functions.balanceOf(account.address).call()
balanceB = tokenB.functions.balanceOf(account.address).call()

print("TokenA balance:", w3.from_wei(balanceA, "ether"))
print("TokenB balance:", w3.from_wei(balanceB, "ether"))


# ========================================
# SECTION 7 — CREATE PAIR
# ========================================

print("\n=== Creating Liquidity Pair ===")

tx = factory.functions.createPair(tokenA_address, tokenB_address).build_transaction({
    "from": account.address,
    "nonce": nonce,
    "gas": 8000000,
    "gasPrice": w3.to_wei("20", "gwei")
})

signed_tx = account.sign_transaction(tx)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
w3.eth.wait_for_transaction_receipt(tx_hash)

nonce += 1

pair_address = factory.functions.getPair(tokenA_address, tokenB_address).call()
print("Pair Address:", pair_address)


# ========================================
# SECTION 8 — APPROVE TOKENS
# ========================================

print("\n=== Approving Tokens to Router ===")

approve_amount = w3.to_wei(1000, "ether")

for token in [tokenA, tokenB]:
    tx = token.functions.approve(router_address, approve_amount).build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gas": 500000,
        "gasPrice": w3.to_wei("20", "gwei")
    })

    signed_tx = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    w3.eth.wait_for_transaction_receipt(tx_hash)

    nonce += 1

print("Approval Completed")


# ========================================
# SECTION 9 — ADD LIQUIDITY
# ========================================

print("\n=== Adding Liquidity ===")

tx = router.functions.addLiquidity(
    tokenA_address,
    tokenB_address,
    approve_amount,
    approve_amount
).build_transaction({
    "from": account.address,
    "nonce": nonce,
    "gas": 8000000,
    "gasPrice": w3.to_wei("20", "gwei")
})

signed_tx = account.sign_transaction(tx)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
w3.eth.wait_for_transaction_receipt(tx_hash)

nonce += 1

print("Liquidity Added Successfully")


# ========================================
# SECTION 10 — CHECK RESERVES
# ========================================

print("\n=== Checking Pool Reserves ===")

pair = w3.eth.contract(address=pair_address, abi=pair_json["abi"])
reserves = pair.functions.getReserves().call()

print("TokenA Reserve:", w3.from_wei(reserves[0], "ether"))
print("TokenB Reserve:", w3.from_wei(reserves[1], "ether"))

print("\n🎉 DEX FULLY OPERAtTIONAL")
      