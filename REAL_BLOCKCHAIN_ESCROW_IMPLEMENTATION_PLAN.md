# Real Sepolia Blockchain and Escrow Implementation Plan

## Scope

This plan covers only the blockchain and escrow path:

```text
Sepolia setup → contract deployment → wallet connection → escrow funding
→ real contract events → escrow release/dispute → canonical ledger display
```

It does not implement IPFS, Verifiable Credentials, DID resolution, or the internals of vulnerability analysis. It only defines the blockchain boundary those systems would eventually call.

The target is a real Sepolia demonstration using ETH escrow. USDC remains a display/conversion concern until an ERC-20 escrow design is introduced.

## Target end state

```text
Organization wallet
  -> sends ETH to TrustBountyEscrow.createEscrow(bountyId)
  -> Sepolia confirms transaction
  -> EscrowFunded event is read from the receipt
  -> app stores the real escrow ID and transaction hash

Authorized verification result
  -> authorized release transaction
  -> TrustBountyEscrow.releaseEscrow(escrowId, researcher)
  -> Sepolia confirms transaction
  -> EscrowReleased event is read
  -> app marks escrow released only from confirmed chain data
```

The UI should never mark a blockchain action as confirmed solely because a button handler completed.

## Current implementation baseline

### Already available

- `TrustBountyEscrow.sol` contains ETH escrow creation, release, and dispute functions.
- `src/blockchain/escrowAbi.ts` contains the core function ABI.
- `src/blockchain/config.ts` reads chain ID, RPC URL, and escrow address from Vite environment variables.
- `src/blockchain/viemClient.ts` creates a Sepolia public client and an injected-wallet client.
- `useEscrowContract.ts` connects to an injected EIP-1193 wallet.
- `createEscrowOnChain()` ABI-encodes `createEscrow(uint256)`.
- `createEscrowOnChain()` sends ETH, waits for a receipt, verifies success, and decodes `EscrowFunded`.
- `fundEscrow()` persists the real escrow ID and funding transaction hash to Firestore.

### Must be replaced or completed

- `releaseEscrowOnChain()` sends an empty zero-value transaction instead of calling `releaseEscrow(...)`.
- `verifySubmission()` can mark escrow released and reputation updated using local state and generated hashes.
- `raiseDispute()` sends an empty transaction to the escrow address and then creates a local confirmed event.
- `castJurorVoteOnChain()` also sends an unencoded transaction.
- Initial ledger entries are mock data with shortened/fake hashes and block numbers.
- The subgraph query requests `blockchainEvents`, while the declared schema exposes different entities.
- `scripts/deploy.ts` assumes Hardhat and a missing `ChainlinkOracleBridge` contract, then falls back to simulated addresses.
- There is no committed Hardhat configuration or complete deployment toolchain visible for the current repository.

## Phase 1 — Establish one real Sepolia deployment

### Objective

Create one authoritative deployed `TrustBountyEscrow` instance on Sepolia and remove simulated deployment addresses from the real demo path.

### Required external setup

- MetaMask or another EIP-1193 wallet
- Sepolia wallet account
- Sepolia ETH for deployment and transactions
- RPC provider account and Sepolia RPC URL, such as Alchemy, Infura, QuickNode, or another provider
- Optional Etherscan account/API key for source verification

### Required configuration

```env
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://...
VITE_TRUST_BOUNTY_ESCROW_ADDRESS=0x<real-deployed-address>
```

Deployment-only secrets must remain outside the Vite-exposed environment:

```env
SEPOLIA_RPC_URL=https://...
DEPLOYER_PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...
```

The deployer key must never use a valuable wallet and must never be imported into frontend code.

### Deployment requirements

- Compile `TrustBountyEscrow.sol` with Solidity `0.8.20`.
- Deploy only the escrow contract for the first real demo.
- Record the deployed address, deployment transaction hash, and deployment block.
- Verify the deployed bytecode and ABI against the repository source.
- Confirm the configured address contains the expected contract bytecode on Sepolia.
- Confirm the frontend points to this exact address and chain ID.

The current simulated addresses in `simulateDeployment()` are not valid deployment evidence and must not be used as runtime configuration.

## Phase 2 — Make network and wallet state authoritative

### Objective

Ensure that all escrow actions use the connected wallet and the configured Sepolia network, with no silent fallback to fake success.

### Required behavior

- Require an injected wallet before funding, release, or dispute actions.
- Require wallet chain ID `11155111`.
- Reject invalid or undeployed contract addresses.
- Display the connected address and Sepolia network clearly.
- Display the wallet’s actual ETH balance.
- Handle account and chain changes by refreshing application state.
- Fail visibly if the user rejects a transaction or the RPC call fails.
- Do not generate a replacement transaction hash after failure.
- Do not add a confirmed ledger event until a successful receipt exists.

### Current code dependencies

```text
WalletModal.tsx
  -> useEscrowContract.ts
  -> window.ethereum
  -> walletClient()
  -> viem custom transport
```

The wallet connection is already substantially real; the key requirement is to make every downstream action obey the same no-fallback rule.

## Phase 3 — Preserve and harden real escrow funding

### Objective

Make `fundEscrow()` a clean, auditable funding transaction path.

### Required transaction

```text
createEscrow(uint256 bountyId)
```

with:

- `to`: configured deployed escrow address
- `data`: ABI-encoded bounty ID
- `value`: ETH amount in wei
- `chainId`: Sepolia
- sender: connected organization wallet

### Required confirmed result

Only after a successful receipt should the application accept:

- Transaction hash
- Block number
- Escrow ID from `EscrowFunded`
- Bounty ID from `EscrowFunded`
- Company address from `EscrowFunded`
- Actual deposited amount from `EscrowFunded`

The app should treat Firestore and React state as cached projections of this result, not as the authority for whether funds exist.

### Important amount constraint

The current UI labels rewards as USDC but converts them to ETH using a demo exchange rate before funding the ETH escrow contract. The real Sepolia escrow therefore holds ETH, not USDC.

For this implementation scope, the presentation must explicitly say:

```text
Demo escrow asset: Sepolia ETH
Displayed reward: USDC-equivalent value
```

The contract should not be presented as holding USDC until an ERC-20 escrow implementation exists.

## Phase 4 — Implement a real escrow release call

### Objective

Replace the current empty transaction with a genuine contract invocation.

### Required contract call

```text
releaseEscrow(uint256 escrowId, address researcher)
```

The call must include:

- The real on-chain escrow ID returned by `EscrowFunded`
- A valid researcher EVM address
- The deployed escrow contract address
- ABI-encoded function data
- The connected company wallet as the sender

### Contract authorization currently in force

`TrustBountyEscrow.sol` permits release only when:

```text
msg.sender == escrow.companyAddress
```

Therefore the release wallet must be the same company address that funded that escrow. A verifier wallet cannot directly release funds under the current contract rule.

### Required confirmed result

The UI may mark the escrow released only after:

1. The release transaction is accepted.
2. The receipt is obtained.
3. The receipt status is successful.
4. `EscrowReleased` is decoded.
5. The decoded escrow ID matches the requested escrow.
6. The decoded researcher address matches the payout address.

The local state should then be refreshed from the contract/event result rather than unconditionally set to `released`.

## Phase 5 — Define the verification-to-release contract boundary

### Objective

Keep the escrow path real without pretending that the current escrow contract verifies vulnerabilities itself.

The current contract has no verifier/oracle authorization. Its release rule is company-controlled release.

For the current Sepolia presentation, the truthful boundary is:

```text
Technical verification happens in the application/verifier boundary
  -> authorized company wallet approves payout
  -> company wallet calls releaseEscrow()
  -> escrow contract transfers ETH
```

This produces a real escrow demonstration without claiming that the blockchain independently verified the vulnerability.

If a future version requires automated release, the contract must gain an explicit authorized verifier/oracle mechanism. That is a contract-design change, not just a frontend change.

## Phase 6 — Implement real dispute transaction handling

### Objective

Ensure disputes create actual escrow contract events.

### Required contract call

```text
raiseDispute(uint256 escrowId)
```

The current frontend sends an empty transaction to the contract instead. The real path must:

- Encode the escrow ID
- Send it to the escrow contract
- Wait for a receipt
- Require success
- Decode `EscrowDisputed`
- Use the actual caller as `disputedBy`

The app must not create a confirmed dispute event from a generated hash when the transaction fails or is rejected.

## Phase 7 — Make the ledger use canonical chain events

### Objective

Make the Network and Explorer views distinguish confirmed EVM events from local/demo records.

### Immediate source of truth

For the first real Sepolia presentation, receipts and direct contract log reads are sufficient for newly created events:

```text
transaction receipt
  -> decoded contract event
  -> normalized BlockchainEvent
  -> UI
```

### Historical source of truth

For a persistent explorer, use either:

- Direct RPC log queries using contract address and event topics, or
- A deployed Sepolia subgraph/indexer

The current subgraph path is not yet authoritative because:

- The query entity does not match the declared schema.
- The response is cast directly into `BlockchainEvent[]`.
- The fallback is the local TrustContext event list.

### Normalized event fields

Every real event shown as confirmed should derive these values from the chain where possible:

```text
eventType
transactionHash
blockNumber
blockTimestamp
contractAddress
logIndex
actor/address
decoded event arguments
```

Synthetic initial records should be separated visually and technically from confirmed Sepolia events.

## Phase 8 — Remove simulated deployment and transaction authority

The blockchain/escrow path should no longer use these as evidence of real execution:

- `simulateDeployment()` addresses
- `generateRealTxHash()` fallback values
- `INITIAL_BLOCKCHAIN_EVENTS` as confirmed current events
- Synthetic block numbers such as `lastBlock + 1`
- Empty `eth_sendTransaction` calls for release, dispute, or verification
- Local `setEscrows(... status: 'released')` before receipt confirmation
- Local `setBlockchainEvents(... status: 'confirmed')` without decoded logs

Mock data may remain for empty/demo screens, but it must be labeled as seeded demo history and must not be mixed with live confirmed Sepolia events.

## Phase 9 — Testing and acceptance criteria

### Contract-level acceptance

- A real `createEscrow()` transaction appears on Sepolia Etherscan.
- The transaction transfers the expected ETH amount.
- `EscrowFunded` contains the expected bounty ID, company address, and amount.
- `escrowCounter` increments on the deployed contract.
- `escrows(escrowId)` returns the expected stored state.
- A real `releaseEscrow()` transaction transfers ETH to the researcher address.
- `EscrowReleased` is emitted with the expected escrow ID and amount.
- A real `raiseDispute()` transaction emits `EscrowDisputed`.
- Unauthorized release attempts revert.
- Invalid or already-released escrow IDs revert.

### Frontend acceptance

- The app refuses to fund on a non-Sepolia network.
- Wallet rejection leaves the escrow unchanged.
- RPC failure leaves the escrow unchanged.
- A pending transaction is not displayed as confirmed.
- The UI shows the real transaction hash and block number.
- The UI shows the actual escrow ID decoded from the receipt.
- Release is impossible without a real escrow ID and researcher address.
- The ledger distinguishes live Sepolia events from seeded demo records.
- Reloading the page does not falsely recreate a confirmed event from local state.

### Operational acceptance

- The deployed contract address is stored in the environment and documented.
- The deployment transaction is recorded.
- The source and bytecode are verified on Sepolia Etherscan, if available.
- The frontend RPC endpoint is valid and rate limits are understood.
- The deployment wallet is separate from any valuable wallet.
- No private key is exposed through `VITE_*` variables or bundled frontend code.

## Final dependency order

```text
1. Sepolia RPC + wallet + test ETH
2. Real TrustBountyEscrow deployment
3. Valid runtime contract address
4. Real wallet/network validation
5. Real createEscrow transaction and receipt
6. Real releaseEscrow transaction and receipt
7. Real raiseDispute transaction and receipt
8. Canonical event normalization
9. Direct-RPC or subgraph historical ledger
10. UI state derived from confirmed chain data
```

The core success condition is:

```text
Every escrow status and confirmed ledger event visible in the presentation
must be traceable to a successful Sepolia transaction receipt or a decoded
historical Sepolia contract log.
```
