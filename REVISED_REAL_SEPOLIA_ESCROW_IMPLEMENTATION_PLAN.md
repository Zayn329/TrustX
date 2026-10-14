# Revised Real Sepolia Escrow Implementation Plan

This plan revises the blockchain/escrow plan using the risks in `REAL_BLOCKCHAIN_ESCROW_RISK_ANALYSIS.md`. It covers only Sepolia, wallet/RPC integration, escrow contract calls, receipts, events, reconciliation, and the ledger UI. It does not cover IPFS, credentials, DIDs, or vulnerability-analysis internals. No implementation work is started by this document.

## 1. Decisions before coding

### Release trust model

The current contract authorizes `releaseEscrow()` when `msg.sender == escrow.companyAddress`. It does not require a verifier or oracle result.

Choose one truthful model:

- **Company-authorized escrow:** application verification is shown, then the funding company wallet approves and executes the real payout.
- **Verifier/oracle-authorized escrow:** an authorized verifier/oracle result is validated by the contract before payout.

The second model requires a contract authorization redesign. Frontend code cannot create that guarantee. The UI and presentation must not claim verifier-enforced release while the contract implements company-authorized release.

### Escrow asset

The contract holds native ETH. The current UI converts USDC-labelled values into ETH using a demo rate. The Sepolia presentation must say:

```text
Escrow asset: Sepolia ETH
Reward display: optional USDC-equivalent estimate
```

It must not claim that USDC is deposited until an ERC-20 escrow design exists.

### Source of truth

1. Successful Sepolia receipt and decoded contract logs.
2. Direct contract reads and RPC log queries.
3. A correctly deployed Sepolia indexer/subgraph.
4. Firestore and React state as cached projections.
5. Seeded records labelled demo history.

Firestore and React state cannot prove that funds were deposited, released, or disputed.

## 2. Target architecture

```text
Wallet → EIP-1193 → viem → Sepolia RPC → TrustBountyEscrow
      → receipt/log decoder → normalized chain event
      → Firestore/React projection → Explorer/Network UI
```

Every write must use the lifecycle `idle → awaiting_wallet → submitted → confirming → confirmed/reverted/unknown`. The UI must never jump from submitted to confirmed.

## 3. External setup and secret boundaries

User setup: MetaMask or compatible wallet, Sepolia account, Sepolia ETH, and wallet chain ID `11155111`.

Deployment setup: Sepolia RPC provider, dedicated deployer wallet, deployment private key outside the frontend, and optionally an Etherscan API key.

Frontend environment:

```env
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://<sepolia-rpc-endpoint>
VITE_TRUST_BOUNTY_ESCROW_ADDRESS=0x<verified-address>
```

Deployment-only environment:

```env
SEPOLIA_RPC_URL=https://<sepolia-rpc-endpoint>
DEPLOYER_PRIVATE_KEY=0x<dedicated-low-value-key>
ETHERSCAN_API_KEY=<optional-verification-key>
```

Never use `VITE_` for a private key, import deployment secrets into `src/`, or use a valuable wallet for deployment/presentation.

## 4. Phase 0 — Contract readiness

The current contract accepts ETH, creates escrows, emits `EscrowFunded`, permits the funding company to release, emits `EscrowReleased`, permits any caller to raise a dispute, and emits `EscrowDisputed`.

It does not currently verify findings, accept an oracle callback, verify a signed result, connect to reputation, resolve disputes, enforce expiry, pause, or recover funds.

Before frontend release work, choose the release model. If verifier/oracle authorization is required, define signer/callback authority, replay protection, escrow/report binding, deadline, dispute override, and failure behavior at the contract level first.

## 5. Phase 1 — One authoritative Sepolia deployment

1. Compile the exact Solidity source used by the ABI.
2. Deploy `TrustBountyEscrow` with a dedicated Sepolia deployer wallet.
3. Record address, deployment transaction, block number, compiler version, and source version.
4. Verify source/bytecode on Sepolia Etherscan where supported.
5. Confirm `getBytecode(address)` returns contract bytecode.
6. Confirm `escrowCounter()` and `escrows(id)` can be read.
7. Put only the verified address in `VITE_TRUST_BOUNTY_ESCROW_ADDRESS`.

The current deployment script is not authoritative because it assumes missing Hardhat setup, references a missing `ChainlinkOracleBridge`, and returns simulated addresses on failure. The real deployment path must fail loudly. The first escrow demo only needs `TrustBountyEscrow` unless the selected release model requires another contract.

## 6. Phase 2 — Strict runtime validation

Before every write, validate configured chain ID, wallet chain ID, RPC-reported chain ID, contract address, contract bytecode, readable `escrowCounter()`, connected wallet, and sufficient ETH. Unsupported chain IDs must be rejected rather than silently mapped to Sepolia.

The UI must distinguish wallet missing, disconnected, wrong chain, invalid configuration, contract missing, RPC unavailable, and ready states.

## 7. Phase 3 — Shared transaction lifecycle

Use one transaction-state boundary for funding, release, and dispute:

```text
idle → awaiting_wallet → submitted(txHash) → confirming(txHash)
→ confirmed(receipt, events) / reverted(receipt) / unknown(txHash)
```

Wallet approval is not confirmation. A transaction hash is not success. A reverted receipt is not success. An RPC timeout after submission is unknown, not failed. Unknown transactions must be reconciled by hash before retry.

Every live event must retain chain ID, contract address, transaction hash, block number, log index, event name, actor, decoded arguments, and provenance. Seeded demo events must not share confirmed-live styling.

## 8. Phase 4 — Real escrow funding

Call `createEscrow(uint256 bountyId) payable` using the verified contract address, ABI-encoded bounty ID, ETH value in wei, connected organization wallet, and Sepolia.

Preconditions: connected wallet, Sepolia network, valid numeric bounty ID, positive ETH amount, verified contract, and no unresolved funding transaction for the bounty.

After a successful receipt, decode `EscrowFunded` and verify the emitted bounty ID, company address, amount, escrow ID, and log contract address. Only then update Firestore/local projections. If Firestore fails after confirmation, retain the chain result and mark projection synchronization pending instead of reporting funding failure.

## 9. Phase 5 — Real escrow release

For the current company-authorized model, call `releaseEscrow(uint256 escrowId, address payable researcher)` with the real escrow ID and a valid non-zero researcher address. The caller must be the stored company address.

Only after a successful receipt and decoded `EscrowReleased` event may the app mark the escrow released, record the payout, display a confirmed event, and update cached bounty data. The current empty zero-value transaction must not remain as a fallback.

If verifier/oracle authorization is selected, revise the contract first so it validates a result bound to chain ID, contract address, escrow ID, proof/report hash, result, nonce, researcher, and deadline.

## 10. Phase 6 — Real dispute recording

Call `raiseDispute(uint256 escrowId)` with ABI-encoded escrow ID, wait for a successful receipt, decode `EscrowDisputed`, and use the actual caller address.

The current contract permits any caller to raise a dispute and does not resolve disputed escrows. The UI must state that limitation or the contract must be revised; it must not imply that this contract already adjudicates disputes.

## 11. Phase 7 — Canonical ledger

For live presentation transactions, use `receipt logs → decode event → normalize → display Sepolia provenance`.

For history after reload, use direct RPC logs or a correctly deployed Sepolia indexer. The current `useIndexedLedger.ts` query is not canonical until its entity names, fields, mappings, and response normalization match the deployed schema.

RPC/indexer failure must display live data unavailable, not silently substitute local confirmed events.

## 12. Phase 8 — Reconciliation and idempotency

Retain pending action metadata: action type, chain ID, contract address, transaction hash, requested arguments, submission time, and lifecycle state.

On reload or uncertain RPC errors, query the receipt, decode/apply the event exactly once if confirmed, mark reverted if reverted, retain pending if not mined, and show unknown if the RPC cannot determine the result. Event identity must use transaction hash plus log index, not `Date.now()`.

Before funding again, reconcile any pending funding hash for that bounty to prevent duplicate escrows.

## 13. Phase 9 — Security and demo gates

### Sepolia demo gate

Verify successful create, release, and dispute transactions; matching event arguments; unauthorized release revert; invalid ID and duplicate release revert; zero payout address rejection; wrong-chain blocking; wallet rejection without an event; RPC timeout reconciliation; and Firestore failure without contradiction of confirmed chain state.

### Before valuable funds

Review ETH transfer/reentrancy behavior, access control, zero-address and missing-escrow validation, dispute lifecycle, expiry, pause/recovery, verifier/oracle authorization if selected, and independent Solidity audit.

Sepolia success is not evidence of mainnet safety.

## 14. Acceptance criteria

### Deployment

- No runtime path returns simulated addresses.
- Configured address contains verified Sepolia bytecode.
- Deployment metadata is recorded.

### Funding

- A real wallet sends ETH through encoded `createEscrow` calldata.
- The receipt succeeds and contains `EscrowFunded`.
- Contract reads match the event.
- UI displays real transaction hash, block, escrow ID, and ETH amount.

### Release

- Encoded release includes the real escrow ID and researcher address.
- Sender satisfies the selected release policy.
- Receipt succeeds and contains `EscrowReleased`.
- UI cannot show released before that evidence.

### Ledger

- Every live confirmed event has a real transaction hash, block number, contract address, and log index.
- Seeded records are labelled separately.
- History comes from direct logs or a matching deployed indexer.

### Presentation

The presentation states the actual Sepolia network, native ETH asset, deployed address, release authority, and the difference between application-level technical verification and blockchain-enforced state transitions.

## 15. Final sequence

```text
0. Choose company-authorized or verifier-authorized release.
1. Make ETH escrow wording explicit.
2. Establish a non-simulated Sepolia deployment path.
3. Deploy and verify TrustBountyEscrow.
4. Validate wallet, RPC, chain ID, and bytecode at runtime.
5. Add shared receipt/event lifecycle and failure states.
6. Harden funding and persist confirmed chain results.
7. Implement receipt-gated encoded release.
8. Implement receipt-gated encoded dispute recording.
9. Add reconciliation and duplicate-action protection.
10. Separate live events from seeded history.
11. Add direct-RPC or correctly deployed indexer history.
12. Run all demo and security gates.
```

## Final success condition

Every live escrow status and confirmed blockchain event shown in the presentation must be traceable to a successful Sepolia receipt or decoded historical Sepolia log, and the UI must accurately state who or what is authorized to release funds.
