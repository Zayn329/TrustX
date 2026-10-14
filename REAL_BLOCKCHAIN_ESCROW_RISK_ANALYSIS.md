# Real Sepolia Blockchain and Escrow — Risk Analysis

This analysis reviews `REAL_BLOCKCHAIN_ESCROW_IMPLEMENTATION_PLAN.md` against the current Trust Engine code and `TrustBountyEscrow.sol` contract.

Scope is limited to:

```text
Sepolia network → wallet → escrow funding → release/dispute → receipts/events → ledger UI
```

It does not assess IPFS, Verifiable Credentials, DID resolution, or the internals of vulnerability analysis except where they affect an escrow decision.

## Risk scale

- **Critical**: Can cause unauthorized loss of funds, false payout, or a fundamentally false trust claim.
- **High**: Can break the real demo or create materially misleading financial/audit state.
- **Medium**: Can cause inconsistent state, operational failure, or degraded reliability.
- **Low**: Mostly affects polish, maintainability, or presentation clarity.

## Executive risk assessment

The most serious risk is not the Sepolia connection itself. The largest risk is that the application may display a real-looking payout or ledger event even though the contract transaction never performed that action.

The current architecture has this dangerous split:

```text
Real funding transaction
  → local verification decision
  → empty/dummy transaction for release
  → local status changed to released
```

The implementation plan correctly moves toward receipt-driven state, but three design decisions need to be explicit before implementation:

1. The current escrow contract allows the funding company to release funds directly; it does not enforce technical verification.
2. The escrow holds native ETH, while the UI presents rewards as USDC-equivalent values.
3. Local React/Firestore data cannot be treated as proof of blockchain state.

## Priority risk matrix

| Rank | Risk | Severity | Likelihood now | Residual after plan | Why it matters |
|---:|---|---|---|---|---|
| 1 | False release state without a real release transaction | Critical | Certain on current path | Low if receipt-gated | Current `verifySubmission()` can mark escrow released locally while `releaseEscrowOnChain()` sends no function call |
| 2 | Release authority does not match verification authority | Critical | High | High unless contract design changes | Contract permits the original company to release; it does not require a verifier/oracle result |
| 3 | Wrong or fake contract address | Critical | High before deployment | Low after bytecode/address verification | Placeholder addresses exist in configuration/deployment fallback paths |
| 4 | Frontend displays local events as confirmed chain events | High | Certain for seeded/actions | Medium unless event sources are separated | Mock hashes, synthetic block numbers, and React state currently share the same event model |
| 5 | Asset mismatch: displayed USDC vs deposited ETH | High | Certain | Medium | Funding converts USDC display values into ETH using a demo rate; the contract only accepts ETH |
| 6 | Incorrect network or RPC endpoint | High | Medium | Low | Chain selection is hard-coded around Sepolia and non-Sepolia IDs fall back to Sepolia |
| 7 | Contract transaction succeeds but Firestore/UI persistence fails | High | Medium | Medium | Chain state and application state can diverge after a successful transaction |
| 8 | Historical ledger is not canonical | High | High | Low–medium | Subgraph query/schema mismatch and local fallback can hide missing or different chain events |
| 9 | Unauthorized or overly broad dispute behavior | High | High | High with current contract | Any caller can call `raiseDispute()` for an eligible escrow |
| 10 | Smart-contract financial/security defects | High | Unknown | Medium until audited | Contract has no pause, reentrancy guard, verifier role, or recovery mechanism |
| 11 | Wallet/provider and user transaction failure | Medium | High | Low–medium | Rejection, wrong account, insufficient gas, and chain switching are normal failure modes |
| 12 | Private-key or deployment-secret exposure | Critical | Medium operationally | Low with separation controls | Deployment requires a private key; Vite variables are frontend-exposed |

## Detailed analysis

## 1. False release state without a real release transaction

### Current exposure

`TrustContext.verifySubmission()` currently updates verification, escrow, reputation, and blockchain-event state locally. The transaction path used there is an empty `eth_sendTransaction` to the escrow address, and failures can fall back to generated transaction hashes.

The Solidity contract’s `releaseEscrow(uint256,address)` function is therefore not the source of truth for the displayed released state.

### Impact

- UI may show that a researcher was paid when no ETH moved.
- A fake transaction hash may appear in the ledger.
- A presentation audience may reasonably believe the blockchain enforced a payout when it did not.

### Required control

The only accepted release state should be:

```text
successful receipt
  + status == success
  + decoded EscrowReleased event
  + expected escrow ID
  + expected researcher address
```

No generated hash, optimistic local status, or button completion should satisfy this condition.

### Residual risk

Low for transaction truth if receipt-gating is enforced. The economic policy risk remains because the contract still trusts the company caller.

## 2. Release authority does not match verification authority

### Current contract rule

The contract requires:

```solidity
msg.sender == escrow.companyAddress
```

That means the company wallet can release the bounty, regardless of whether the application’s technical verification state says valid or invalid.

### Impact

- The contract does not enforce the advertised “verification triggers payout” model.
- A company can release without verification.
- A company can refuse to release after a valid verification.
- A compromised company wallet can release eligible escrow funds.

### Required decision

The plan must distinguish two valid demo claims:

**Current contract claim:**

```text
Company-controlled real escrow with on-chain payout.
```

**Stronger protocol claim:**

```text
Verifier/oracle-authorized conditional escrow.
```

The second claim requires a contract authorization model, such as an authorized verifier, signed verification result, arbitration result, or oracle callback. Frontend wiring alone cannot create this guarantee.

### Residual risk

High until the contract’s release authorization reflects the intended trust model.

## 3. Wrong or fake contract address

### Current exposure

`.env.example` contains placeholder-looking addresses. `scripts/deploy.ts` includes a simulated deployment path and references a missing `ChainlinkOracleBridge` contract. The frontend validates address shape but does not prove that bytecode at the address matches `TrustBountyEscrow.sol`.

### Impact

- Transactions can be sent to an externally owned account or unrelated contract.
- Events may not decode as expected.
- The demo can silently point at the wrong deployment.

### Required control

At startup or deployment verification time, confirm:

- Address is a valid checksum address.
- Code exists at the address.
- Chain ID is Sepolia.
- Expected contract bytecode or verified source matches the repository contract.
- A read such as `escrowCounter()` succeeds.

### Residual risk

Low after deployment-address verification and a recorded deployment artifact.

## 4. Local events presented as confirmed blockchain events

### Current exposure

`INITIAL_BLOCKCHAIN_EVENTS` contains shortened/mock hashes and seeded block numbers. `verifySubmission()` and `raiseDispute()` create `confirmed` local events using generated hashes and `lastBlock + 1`.

The same `BlockchainEvent` type represents both real and simulated records.

### Impact

- Users cannot tell which events are actually on Sepolia.
- The explorer can show impossible block ordering.
- A local state update can look identical to a decoded contract log.

### Required control

Separate event provenance explicitly, for example:

```text
source: 'sepolia_receipt' | 'sepolia_indexer' | 'seeded_demo'
```

Only receipt/indexer records should be labeled confirmed. Seeded records should be visibly labeled demo history.

### Residual risk

Medium unless the data model and UI provenance are separated.

## 5. Asset mismatch: USDC display versus ETH escrow

### Current exposure

`fundEscrow()` accepts a bounty whose currency is `USDC`, converts the display amount to ETH using `VITE_DEMO_USDC_PER_ETH`, and sends native ETH to `createEscrow()`.

The contract has no ERC-20 token address, allowance flow, or `transferFrom()` logic.

### Impact

- The organization may believe it deposited USDC while it actually deposited ETH.
- Exchange-rate changes can make displayed amounts inaccurate.
- A presentation can overstate token support.

### Required control

For the Sepolia implementation, rename and display the flow as:

```text
Sepolia ETH escrow
USDC-equivalent display value only
```

Do not call the contract a USDC escrow until an ERC-20 escrow design is implemented and tested.

### Residual risk

Medium as a product/model limitation; low as a technical risk if the UI is explicit.

## 6. Incorrect network or RPC endpoint

### Current exposure

The client creates a Sepolia viem chain when `CHAIN_ID === 11155111`, but unknown chain IDs fall back to Sepolia. This can make a configuration mistake look like a valid Sepolia setup.

The wallet’s actual chain ID is checked during funding, but the public client’s chain configuration is not a generic dynamic chain definition.

### Impact

- Reads and writes can disagree about the network.
- A user can see one chain in the wallet and query another RPC.
- Rate limits or RPC outages can cause incomplete UI state.

### Required control

- Reject unsupported chain IDs instead of silently falling back.
- Compare wallet chain ID, configured chain ID, and RPC chain ID.
- Verify the escrow address on the configured chain before enabling actions.
- Treat RPC errors as unknown state, not as “no escrow” or “not released.”

### Residual risk

Low after strict chain/RPC identity checks.

## 7. Chain succeeds but application persistence fails

### Current exposure

After successful escrow creation, the app updates Firestore and local state. The blockchain transaction can succeed while the Firestore write fails or the browser closes before the update completes.

### Impact

- Funds exist on-chain but the app shows an unfunded bounty.
- The user may retry and create a second escrow.
- The application may lose the mapping between bounty and escrow ID.

### Required control

- Treat the transaction receipt as durable success independent of Firestore.
- Persist transaction hash immediately when known.
- Reconcile bounties by reading contract events or escrow state.
- Make funding idempotent using the on-chain escrow ID.
- Do not block truth recovery on Firestore availability.

### Residual risk

Medium until reconciliation exists; Firestore remains a projection, not the source of truth.

## 8. Historical ledger is not canonical

### Current exposure

`useIndexedLedger.ts` queries `blockchainEvents`, while the subgraph schema defines other entities. On failure it falls back to local `TrustContext` events.

### Impact

- Historical events can be missing or incorrectly shaped.
- The explorer may show local events after a real chain event is absent.
- The UI cannot reliably prove event history after reload.

### Required control

Choose and document one canonical read path:

1. Direct RPC event logs for the initial demo, or
2. A deployed Sepolia indexer/subgraph with matching schema and mappings.

If a fallback remains, it must be labeled as unavailable/offline data rather than confirmed chain history.

### Residual risk

Low–medium depending on whether the presentation needs historical search or only the current transaction receipt.

## 9. Dispute authorization is too broad

### Current contract behavior

`raiseDispute()` has no caller restriction. Any address can dispute an eligible escrow.

### Impact

- Third parties can lock/dispute another party’s escrow.
- UI identity and contract caller may differ.
- The dispute model can be spammed.

### Required control

For a demo, clearly state who is allowed to dispute. For a real protocol, the contract should enforce an authorization rule or a defined dispute window/role model.

The frontend must also pass the actual escrow ID and decode `EscrowDisputed` instead of sending an empty transaction.

### Residual risk

High until contract authorization rules are defined and enforced.

## 10. Smart-contract financial and security risks

### Observations from the current contract

- No pause/emergency stop exists.
- No reentrancy guard exists.
- ETH is transferred using a low-level `call`.
- Checks-effects-interactions ordering is partially followed because status is set before the call.
- No explicit zero-address check exists for the researcher payout address.
- No explicit escrow existence check exists before status checks.
- No verifier/oracle role exists.
- No dispute resolution path exists inside `TrustBountyEscrow` after `Disputed`.
- No expiry or timeout exists.
- No rescue or recovery path exists for stuck funds.

### Impact

These are material protocol design and audit risks even if the Sepolia demo works.

### Required control

Before using real money or calling the system production-ready:

- Add tests for invalid IDs, zero addresses, duplicate release, failed transfers, and unauthorized callers.
- Run Solidity static analysis and obtain an independent contract audit.
- Define pause, dispute, expiry, and recovery policy.
- Use a dedicated testnet wallet and test ETH for the presentation.

### Residual risk

Medium for a controlled Sepolia demo; unacceptable for mainnet or valuable funds without a contract redesign/audit.

## 11. Wallet and user-operation risk

### Current exposure

Users can reject transactions, have insufficient ETH, switch accounts, or remain on the wrong network. RPC calls can time out after the wallet has already submitted a transaction.

### Impact

- The UI may incorrectly show failure after a transaction actually mined.
- Users may retry and create duplicate escrows.
- Pending states may persist indefinitely.

### Required control

- On uncertain errors, look up the transaction hash before deciding failure.
- Persist pending transaction metadata locally and reconcile on reload.
- Disable duplicate funding while a transaction is pending.
- Show pending, confirmed, reverted, and unknown states separately.
- Use receipt status rather than wallet request resolution alone.

### Residual risk

Low–medium with transaction reconciliation.

## 12. Secret exposure and deployment operations

### Current exposure

The environment example correctly separates deployment variables from `VITE_*` variables, but all `VITE_*` values are bundled into a browser application. RPC provider keys in frontend variables should be treated as public/restricted credentials.

### Impact

- Deployer private key exposure can lead to total wallet loss.
- Unrestricted RPC keys can be abused or rate-limited.
- A committed `.env` can leak deployment authority.

### Required control

- Never prefix private keys with `VITE_`.
- Use a dedicated low-value deployer wallet.
- Keep deployment secrets in local/CI secret stores.
- Restrict RPC keys by domain and method where supported.
- Rotate any key that has been committed or exposed.
- Do not deploy from the same wallet used for user funding.

### Residual risk

Low with proper operational separation; Critical if a deployer key enters the frontend bundle.

## Implementation gates

The work should be considered safe to demonstrate only when all of these gates pass:

### Gate A — Deployment identity

- The configured address is a real Sepolia contract.
- Contract bytecode exists at the address.
- `escrowCounter()` can be read.
- Source/ABI/version are recorded.

### Gate B — Funding truth

- A real wallet funds an escrow.
- The receipt succeeds.
- `EscrowFunded` is decoded.
- The contract read matches the decoded event.
- The UI displays the real transaction hash, block, escrow ID, and ETH amount.

### Gate C — Release truth

- Release is sent with encoded arguments.
- The sender satisfies the contract’s company authorization rule.
- The receipt succeeds.
- `EscrowReleased` is decoded.
- The researcher receives the expected ETH.
- The UI does not show released before this evidence exists.

### Gate D — Failure truth

- Rejected transactions do not create confirmed events.
- Reverted transactions do not change escrow status.
- RPC uncertainty produces a pending/unknown state and reconciliation attempt.
- Firestore failure does not erase or contradict a confirmed chain result.

### Gate E — Ledger truth

- Every live confirmed event has a real transaction hash and block number.
- Seeded demo events are labeled separately.
- Historical reads come from direct RPC logs or a correctly deployed indexer.
- The UI does not silently substitute local events for missing live data.

## Recommended risk treatment order

1. Remove false release success and generated confirmed transaction hashes.
2. Verify the real Sepolia contract deployment and address.
3. Make funding, release, and dispute actions receipt-driven.
4. Resolve the company-release versus verifier-release authorization decision.
5. Separate live chain events from seeded/demo events.
6. Make the ETH-versus-USDC model explicit.
7. Add transaction reconciliation for reloads and uncertain RPC errors.
8. Establish one canonical historical ledger source.
9. Harden contract edge cases and test failures.
10. Treat the result as Sepolia demonstration infrastructure, not mainnet-ready escrow.

## Final assessment

The plan is technically feasible for a real Sepolia demonstration, but the funding path and the payout policy have different risk profiles.

```text
Real funding: achievable with current architecture after deployment/configuration.
Real release: achievable technically, but currently company-authorized.
Verified conditional payout: not guaranteed by the current contract design.
Canonical ledger: achievable after removing local confirmation and fixing reads.
Mainnet safety: not established by this plan.
```
