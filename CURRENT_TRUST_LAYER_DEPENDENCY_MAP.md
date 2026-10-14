# Current Trust Layer Dependency Map

This document describes the current architecture and dependencies for the three most important demo-to-real areas:

1. blockchain events and escrow,
2. technical vulnerability verification,
3. cryptographic signatures.

It is a current-state map only. It does not define an implementation plan.

## 1. Blockchain Events and Escrow

### Current dependency flow

```text
User action in UI
  -> TrustContext.tsx / useEscrowContract.ts
  -> injected wallet (EIP-1193 / MetaMask or compatible wallet)
  -> viem wallet client
  -> EVM RPC network
  -> TrustBountyEscrow.sol
  -> transaction receipt and contract events
  -> useIndexedLedger.ts / TrustContext.tsx
  -> ExplorerView.tsx / NetworkView.tsx / escrow UI
```

### Existing components

| Component | Current role | Current state |
|---|---|---|
| `src/components/bounties/CreateBountyModal.tsx` | Starts the bounty creation flow | UI/domain-state driven |
| `src/components/bounties/SubmitVulnerabilityModal.tsx` | Creates a submission and proof flow | Uses local state plus Web3 hooks |
| `src/blockchain/useEscrowContract.ts` | Connects wallet, signs data, creates escrow, sends transactions | Hybrid; escrow creation is the strongest real path |
| `src/blockchain/viemClient.ts` | Provides public and wallet clients | Real integration boundary |
| `src/blockchain/wagmiConfig.ts` | Wallet/network configuration | Real integration boundary |
| `src/blockchain/config.ts` | Chain ID, RPC, contract-address configuration | Requires deployment/configuration values |
| `src/blockchain/escrowAbi.ts` | Contract function/event definitions | Connects frontend calls to Solidity ABI |
| `contracts/TrustBountyEscrow.sol` | Holds, locks, releases, and disputes bounty funds | Real contract logic exists |
| `src/store/TrustContext.tsx` | Updates submissions, verification, reputation, and visible event state | Local React state remains a major source of truth |
| `src/store/useIndexedLedger.ts` | Reads indexed blockchain events | Hybrid; query/schema mismatch exists |
| `subgraph/schema.graphql` | Declares indexer entities | Exists, but does not match the current query fully |
| `src/components/views/ExplorerView.tsx` | Displays contribution/event history | Consumes combined local/indexed data |
| `src/components/views/NetworkView.tsx` | Displays ledger and network activity | Consumes simulated or indexed event data |

### Connected contract state

The escrow contract is connected to:

```text
organization wallet
  -> createEscrow(bountyId)
  -> EscrowFunded event
  -> locked escrow state
  -> verification/dispute result
  -> releaseEscrow(escrowId, researcher)
  -> EscrowReleased event
```

The contract also emits dispute-related events. The frontend has corresponding escrow and dispute models, but not every UI action currently completes a correctly encoded contract call.

### Current boundary between real and local behavior

Real or intended-real:

- Wallet connection through an injected provider
- RPC communication through viem
- Escrow creation transaction and receipt handling
- Solidity escrow state and events, when deployed and configured

Still local, simulated, or incomplete:

- Several blockchain events are generated in React state
- Verification and reputation actions can update local state without a confirmed transaction
- Escrow release currently sends an unencoded transaction rather than a complete contract function call
- Some escrow addresses are mock strings rather than valid deployed EVM addresses
- The indexer query does not fully match the declared GraphQL schema

The main data-authority conflict is:

```text
Blockchain contract state       vs.       TrustContext local React state
```

Both currently influence what the UI displays.

## 2. Technical Vulnerability Verification

### Current dependency flow

```text
Vulnerability submission
  -> report and reproduction steps
  -> oracle/sandboxRunner.ts
  -> optional remote oracle service
  -> local fallback analysis
  -> verification result
  -> TrustContext.tsx
  -> Verification model
  -> reputation / escrow / dispute UI
```

### Existing components

| Component | Current role | Current state |
|---|---|---|
| `src/components/bounties/SubmitVulnerabilityModal.tsx` | Collects report, impact, evidence, and reproduction steps | Real frontend input, local submission flow |
| `oracle/sandboxRunner.ts` | Evaluates the reproduction payload | Hybrid; remote service optional, local analysis simulated |
| `src/components/ui/OracleVerificationBadge.tsx` | Displays oracle result and execution information | UI presentation of hybrid result |
| `src/components/views/ExplorerView.tsx` | Shows proof and verification lifecycle | Consumes verification state |
| `src/store/TrustContext.tsx` | Applies verification status and downstream changes | Local React state is currently central |
| `contracts/TrustBountyEscrow.sol` | Could enforce payout after an accepted result | Contract exists, but requires trusted verification input |
| `contracts/ReputationRegistry.sol` | Could store reputation changes on-chain | Contract exists, frontend update is mainly local |
| `contracts/DisputeArbitration.sol` | Could handle contested verification outcomes | Contract exists, UI path is hybrid |
| `ChainlinkOracleBridge.sol` | Intended blockchain-to-oracle callback bridge | Missing from repository |

### What the current verifier is connected to

The verifier receives or derives:

- Vulnerability type
- Reproduction steps
- Evidence/payload text
- Bounty context
- Expected verification requirements

Its result is connected to:

```text
verification status
  -> accepted/rejected/disputed contribution
  -> reputation event
  -> escrow release or continued lock
  -> explorer timeline
  -> dashboard metrics
```

### Current boundary between real and local behavior

Real or structurally present:

- Submission data is collected from the user
- The verifier has a defined service boundary
- Verification states are modeled explicitly
- Solidity contracts contain reputation, escrow, and arbitration logic

Still simulated or incomplete:

- Local fallback analysis is based on keyword/regex-style pattern matching
- Coverage and execution logs can be synthetic
- No reliable isolated Foundry/Docker execution is currently the source of truth
- The oracle bridge contract is missing
- Verification results do not consistently originate from a confirmed external execution
- A verification result can update UI state without a corresponding on-chain record

The main trust dependency is:

```text
Smart contract payout safety depends on the authenticity of the verification result.
```

The blockchain can enforce the payout rule, but it cannot independently determine whether the vulnerability exists.

## 3. Cryptographic Signatures

### Current dependency flow

```text
Submission payload
  -> SHA-256 proof hash
  -> EIP-712 typed ProofAnchor message
  -> connected wallet
  -> eth_signTypedData_v4
  -> signature
  -> proof record / blockchain transaction
  -> later signature verification
```

For reputation credentials, the separate flow is:

```text
Trust score data
  -> VC JSON-LD document
  -> vcManager.ts
  -> JWS proof
  -> credential QR/export UI
  -> external or local verifier
```

### Existing components

| Component | Current role | Current state |
|---|---|---|
| `src/domain/cryptoUtils.ts` | SHA-256 hashing and signature-related helpers | SHA-256 is real; fallback signatures exist |
| `src/components/bounties/SubmitVulnerabilityModal.tsx` | Starts proof creation | Connects submission to proof flow |
| `src/blockchain/useEscrowContract.ts` | Builds EIP-712 `ProofAnchor` data and requests wallet signature | Real wallet path exists; fallback path remains |
| `window.ethereum` | Wallet signing provider | Real when a compatible wallet is connected |
| `src/identity/vcManager.ts` | Builds and validates W3C-style credentials | Schema is real; signing is simulated locally |
| `src/identity/didResolver.ts` | Resolves DID documents and verification methods | Local/remote hybrid |
| `src/components/passport/CredentialQRModal.tsx` | Presents/export credentials | UI/export layer |
| `src/components/ui/ProofCard.tsx` | Displays proof hash and signature status | Presentation layer |

### Current signature types

The project has two distinct signature concepts:

1. **Researcher proof signature**

```text
researcher DID + bounty ID + proof hash + nonce
  -> EIP-712 wallet signature
```

This has a real wallet-signing path through `eth_signTypedData_v4`.

2. **Issuer signature for a Verifiable Credential**

```text
credential payload
  -> JWS-shaped proof
```

The credential currently has the expected W3C/JWS structure, but the local signature value is not a genuine asymmetric signature produced by an issuer private key.

### Current boundary between real and local behavior

Real or structurally present:

- SHA-256 evidence hashing
- EIP-712 typed-data construction
- Wallet signature prompt when a wallet is connected
- DID document structure and verification-method metadata
- W3C credential document structure

Still simulated or incomplete:

- Fallback proof signatures when wallet signing is unavailable
- Verifiable Credential JWS cryptography
- Private-key custody and issuer-key rotation
- Complete signature verification against public keys
- Credential revocation and expiry enforcement

## Cross-System Dependency Map

```text
                         ┌─────────────────────────┐
                         │ Researcher / Organization│
                         └────────────┬────────────┘
                                      │ wallet connection
                                      ▼
                         ┌─────────────────────────┐
                         │ EIP-1193 Wallet Provider │
                         └───────┬─────────┬─────────┘
                                 │         │
                      EIP-712 proof       │ transactions
                                 │         ▼
                                 │  ┌──────────────────┐
                                 │  │ EVM RPC + viem   │
                                 │  └────────┬─────────┘
                                 │           ▼
                                 │  ┌──────────────────┐
                                 │  │ Solidity Contracts│
                                 │  │ Escrow / Registry │
                                 │  │ Arbitration       │
                                 │  └────────┬─────────┘
                                 │           │ events/state
                                 ▼           ▼
                         ┌─────────────────────────┐
                         │ Proof + local app state │
                         └────────────┬────────────┘
                                      │ submission
                                      ▼
                         ┌─────────────────────────┐
                         │ Oracle / Sandbox         │
                         │ Technical verification  │
                         └────────────┬────────────┘
                                      │ result
                                      ▼
                         ┌─────────────────────────┐
                         │ Verification state       │
                         └──────┬─────────┬────────┘
                                │         │
                         reputation     escrow decision
                                │         │
                                ▼         ▼
                         ┌──────────┐ ┌──────────────┐
                         │ Registry │ │ Escrow payout │
                         └──────────┘ └──────────────┘
```

## Current System-of-Record Summary

| Concern | Intended authoritative source | Current effective source |
|---|---|---|
| Evidence integrity | SHA-256 hash | Mostly real client hash |
| Researcher authorization | Wallet signature | Real wallet when available; fallback otherwise |
| Credential authenticity | Issuer asymmetric signature | Local JWS-shaped structure |
| Verification validity | Isolated oracle execution | Hybrid remote/fallback local analysis |
| Escrow funds | `TrustBountyEscrow.sol` | Real only for correctly configured contract paths |
| Reputation | `ReputationRegistry.sol` | Mostly React state |
| Blockchain event history | EVM logs/subgraph | Local event stream plus incomplete indexer path |
| Dispute outcome | Arbitration contract | Hybrid contract/UI state |

## Bottom Line

The three areas are not isolated:

```text
Real signature → trustworthy proof identity
Real verification → trustworthy payout condition
Real contract event → trustworthy financial/audit record
```

If any one of these remains simulated, the corresponding trust claim remains partly UI-driven even when the other two are real.
